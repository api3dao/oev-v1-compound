import {
  API_ETH_MOCK_ADDRESS,
  ApproveDelegationType,
  gasLimitRecommendations,
  InterestRate,
  MAX_UINT_AMOUNT,
  ProtocolAction,
} from "contract-helpers";
import { BoxProps } from "@mui/material";
import { parseUnits } from "ethers/lib/utils";
import { queryClient } from "pages/_app";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useBackgroundDataProvider } from "src/hooks/app-data-provider/BackgroundDataProvider";
import {
  ComputedReserveData,
  useAppDataContext,
} from "src/hooks/app-data-provider/useAppDataProvider";
import { useModalContext } from "src/hooks/useModal";
import { useRootStore } from "src/store/root";
import { getErrorTextFromError, TxAction } from "src/ui-config/errorMapping";
import { QueryKeys } from "src/ui-config/queries";

import { TxActionsWrapper } from "../TxActionsWrapper";
import { APPROVE_DELEGATION_GAS_LIMIT, checkRequiresApproval } from "../utils";
import { useWeb3Context } from "src/hooks/lib/hooks/useWeb3Context";
import { populateChainConfigs, populateCompoundMarket } from "configuration";
import { getWithdrawTransactionData } from "src/helpers/compoundHelpers";
import { useEthersSigner } from "src/hooks/lib/ethers";

export interface BorrowActionsProps extends BoxProps {
  poolReserve: ComputedReserveData;
  amountToBorrow: string;
  poolAddress: string;
  interestRateMode: InterestRate;
  isWrongNetwork: boolean;
  symbol: string;
  blocked: boolean;
  isMax?: boolean;
}

export const BorrowActions = ({
  symbol,
  poolReserve,
  amountToBorrow,
  poolAddress,
  interestRateMode,
  isWrongNetwork,
  blocked,
  sx,
}: BorrowActionsProps) => {
  const [
    borrow,
    getCreditDelegationApprovedAmount,
    currentMarketData,
    generateApproveDelegation,
    estimateGasLimit,
    addTransaction,
  ] = useRootStore((state) => [
    state.borrow,
    state.getCreditDelegationApprovedAmount,
    state.currentMarketData,
    state.generateApproveDelegation,
    state.estimateGasLimit,
    state.addTransaction,
  ]);
  const {
    approvalTxState,
    mainTxState,
    loadingTxns,
    setMainTxState,
    setTxError,
    setGasLimit,
    setLoadingTxns,
    setApprovalTxState,
  } = useModalContext();
  const { refetchPoolData, refetchIncentiveData, refetchGhoData } =
    useBackgroundDataProvider();
  const { sendTx } = useWeb3Context();
  const [requiresApproval, setRequiresApproval] = useState<boolean>(false);
  const [approvedAmount, setApprovedAmount] = useState<
    ApproveDelegationType | undefined
  >();

  const compoundMarket = populateCompoundMarket();
  const compoundConfig = populateChainConfigs();
  const isCompound = compoundConfig.currentMarket === "compound";
  const signer = useEthersSigner();

  const approval = async () => {
    try {
      if (requiresApproval && approvedAmount) {
        let approveDelegationTxData = generateApproveDelegation({
          debtTokenAddress:
            interestRateMode === InterestRate.Variable
              ? poolReserve.variableDebtTokenAddress
              : poolReserve.stableDebtTokenAddress,
          delegatee: currentMarketData.addresses.WETH_GATEWAY ?? "",
          amount: MAX_UINT_AMOUNT,
        });
        setApprovalTxState({ ...approvalTxState, loading: true });
        approveDelegationTxData = await estimateGasLimit(
          approveDelegationTxData,
        );
        const response = await sendTx(approveDelegationTxData);
        await response.wait(1);
        setApprovalTxState({
          txHash: response.hash,
          loading: false,
          success: true,
        });
        fetchApprovedAmount(true);
      }
    } catch (error) {
      const parsedError = getErrorTextFromError(
        error,
        TxAction.GAS_ESTIMATION,
        false,
      );
      setTxError(parsedError);
      setApprovalTxState({
        txHash: undefined,
        loading: false,
      });
    }
  };

  const action = async () => {
    try {
      setMainTxState({ ...mainTxState, loading: true });

      let borrowTxData;

      if (isCompound) {
        borrowTxData = await getWithdrawTransactionData(
          compoundMarket.comet,
          poolAddress,
          parseUnits(amountToBorrow, poolReserve.decimals).toString(),
          signer,
        );
      } else {
        borrowTxData = borrow({
          amount: parseUnits(amountToBorrow, poolReserve.decimals).toString(),
          reserve: poolAddress,
          interestRateMode,
          debtTokenAddress:
            interestRateMode === InterestRate.Variable
              ? poolReserve.variableDebtTokenAddress
              : poolReserve.stableDebtTokenAddress,
        });
      }

      borrowTxData = await estimateGasLimit(borrowTxData);

      const response = await sendTx(borrowTxData);
      await response.wait(1);
      setMainTxState({
        txHash: response.hash,
        loading: false,
        success: true,
      });

      addTransaction(response.hash, {
        action: ProtocolAction.borrow,
        txState: "success",
        asset: poolAddress,
        amount: amountToBorrow,
        assetName: poolReserve.name,
      });

      queryClient.invalidateQueries({ queryKey: [QueryKeys.POOL_TOKENS] });
      refetchPoolData && refetchPoolData();
      refetchIncentiveData && refetchIncentiveData();
      refetchGhoData && refetchGhoData();
    } catch (error) {
      console.log("borrow trx  error ", { error });
      const parsedError = getErrorTextFromError(
        error,
        TxAction.GAS_ESTIMATION,
        false,
      );
      setTxError(parsedError);
      setMainTxState({
        txHash: undefined,
        loading: false,
      });
    }
  };

  // callback to fetch approved credit delegation amount and determine execution path on dependency updates
  const fetchApprovedAmount = useCallback(
    async (forceApprovalCheck?: boolean) => {
      // Check approved amount on-chain on first load or if an action triggers a re-check such as an approveDelegation being confirmed
      if (
        poolAddress === API_ETH_MOCK_ADDRESS &&
        (approvedAmount === undefined || forceApprovalCheck)
      ) {
        setLoadingTxns(true);
        const approvedAmount = await getCreditDelegationApprovedAmount({
          debtTokenAddress:
            interestRateMode === InterestRate.Variable
              ? poolReserve.variableDebtTokenAddress
              : poolReserve.stableDebtTokenAddress,
          delegatee: currentMarketData.addresses.WETH_GATEWAY ?? "",
        });
        setApprovedAmount(approvedAmount);
      } else {
        setRequiresApproval(false);
        setApprovalTxState({});
      }

      if (approvedAmount && poolAddress === API_ETH_MOCK_ADDRESS) {
        const fetchedRequiresApproval = checkRequiresApproval({
          approvedAmount: approvedAmount.amount,
          amount: amountToBorrow,
          signedAmount: "0",
        });
        setRequiresApproval(fetchedRequiresApproval);
        if (fetchedRequiresApproval) setApprovalTxState({});
      }

      setLoadingTxns(false);
    },
    [
      amountToBorrow,
      approvedAmount,
      currentMarketData.addresses.WETH_GATEWAY,
      getCreditDelegationApprovedAmount,
      interestRateMode,
      poolAddress,
      poolReserve.stableDebtTokenAddress,
      poolReserve.variableDebtTokenAddress,
      setApprovalTxState,
      setLoadingTxns,
    ],
  );

  // Run on first load of reserve to determine execution path
  useEffect(() => {
    fetchApprovedAmount();
  }, [fetchApprovedAmount, poolAddress]);

  // Update gas estimation
  useEffect(() => {
    let borrowGasLimit = 0;
    borrowGasLimit = Number(
      gasLimitRecommendations[ProtocolAction.borrow].recommended,
    );
    if (requiresApproval && !approvalTxState.success) {
      borrowGasLimit += Number(APPROVE_DELEGATION_GAS_LIMIT);
    }
    setGasLimit(borrowGasLimit.toString());
  }, [requiresApproval, approvalTxState, setGasLimit]);

  // const modalTitle = isCompound ? "Withdraw" : "Borrow";
  const { compoundState } = useAppDataContext();

  const isBaseSupplied = useMemo(() => {
    if (!compoundState?.assetInfo?.baseInfo?.suppliedFormatted) {
      return false;
    }

    return compoundState?.assetInfo?.baseInfo?.suppliedFormatted > 0.001
      ? true
      : false;
  }, [compoundState]);

  const isBorrowCapacityAvailable = useMemo(() => {
    if (!compoundState?.assetInfo?.baseInfo?.borrowCapacityBase) {
      return false;
    }

    return compoundState?.assetInfo?.baseInfo?.borrowCapacityBase > 0
      ? true
      : false;
  }, [compoundState]);

  const modalTitle = isCompound
    ? poolAddress === compoundMarket.marketAsset && !isBaseSupplied
      ? "Borrow"
      : "Withdraw"
    : "Borrow";

  return (
    <TxActionsWrapper
      blocked={blocked}
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      requiresAmount={true}
      amount={amountToBorrow}
      isWrongNetwork={isWrongNetwork}
      handleAction={action}
      actionText={
        <div>
          {modalTitle} {symbol}
        </div>
      }
      actionInProgressText={
        <div>
          {isCompound ? "Tx Pending..." : "Borrowing"} {symbol}
        </div>
      }
      handleApproval={() => approval()}
      requiresApproval={requiresApproval}
      preparingTransactions={loadingTxns}
      sx={sx}
    />
  );
};
