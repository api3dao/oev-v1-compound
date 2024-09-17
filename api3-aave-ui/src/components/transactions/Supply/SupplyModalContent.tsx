import { API_ETH_MOCK_ADDRESS } from "contract-helpers";
import {
  calculateHealthFactorFromBalancesBigUnits,
  USD_DECIMALS,
  valueToBigNumber,
} from "@aave/math-utils";
import BigNumber from "bignumber.js";
import React, { useMemo, useState } from "react";
import { Warning } from "src/components/primitives/Warning";
import { useAssetCaps } from "src/hooks/useAssetCaps";
import { useModalContext } from "src/hooks/useModal";
import { useProtocolDataContext } from "src/hooks/useProtocolDataContext";

import { useRootStore } from "src/store/root";
import { getMaxAmountAvailableToSupply } from "src/utils/getMaxAmountAvailableToSupply";
import { GENERAL } from "src/utils/mixPanelEvents";
import { roundToTokenDecimals } from "src/utils/utils";

import { useAppDataContext } from "../../../hooks/app-data-provider/useAppDataProvider";
import { CapType } from "../../caps/helper";
import { AssetInput } from "../AssetInput";
import { GasEstimationError } from "../FlowCommons/GasEstimationError";
import { ModalWrapperProps } from "../FlowCommons/ModalWrapper";
import { TxSuccessView } from "../FlowCommons/Success";
import {
  DetailsCollateralLine,
  DetailsHFLine,
  DetailsIncentivesLine,
  DetailsNumberLine,
  TxModalDetails,
} from "../FlowCommons/TxModalDetails";
import { getAssetCollateralType } from "../utils";
import { SupplyActions } from "./SupplyActions";
import { ERC20TokenType } from "src/hooks/lib/Web3Provider";
import { populateChainConfigs } from "configuration";

export enum ErrorType {
  CAP_REACHED,
}

export const SupplyModalContent = ({
  underlyingAsset,
  poolReserve,
  userReserve,
  isWrongNetwork,
  nativeBalance,
  tokenBalance,
  modalTitle,
}: ModalWrapperProps) => {
  const { marketReferencePriceInUsd, user, compoundState } =
    useAppDataContext();
  const { currentMarketData, currentNetworkConfig } = useProtocolDataContext();
  const { mainTxState: supplyTxState, gasLimit, txError } = useModalContext();
  const { supplyCap: supplyCapUsage, debtCeiling: debtCeilingUsage } =
    useAssetCaps();
  const minRemainingBaseTokenBalance = useRootStore(
    (state) => state.poolComputed.minRemainingBaseTokenBalance,
  );
  const compoundMarket = populateChainConfigs();
  const isCompound = compoundMarket.currentMarket === "compound";
  const compSupplyAPY = useMemo(() => {
    return compoundState?.assetInfo?.supplyAPR;
  }, [compoundState]);

  // states
  const [amount, setAmount] = useState("");
  const supplyUnWrapped =
    underlyingAsset.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase();

  console.log("supply modal ", { tokenBalance });

  const isBaseBorrowed = useMemo(() => {
    if (!compoundState?.assetInfo?.baseInfo?.borrowedInBase) {
      return false;
    }

    return compoundState?.assetInfo?.baseInfo?.borrowedInBase > 0
      ? true
      : false;
  }, [compoundState]);

  const baseBorrowed = useMemo(() => {
    return compoundState?.assetInfo?.baseInfo?.borrowedInBase;
  }, [compoundState]);

  const currBal = isCompound
    ? isBaseBorrowed
      ? baseBorrowed
      : tokenBalance
    : tokenBalance;

  const walletBalance = supplyUnWrapped ? nativeBalance : currBal;

  const supplyApy = poolReserve?.supplyAPY;
  const {
    supplyCap,
    totalLiquidity,
    isFrozen,
    decimals,
    debtCeiling,
    isolationModeTotalDebt,
  } = poolReserve;

  // Calculate max amount to supply
  const maxAmountToSupply = useMemo(
    () =>
      getMaxAmountAvailableToSupply(
        walletBalance,
        {
          supplyCap,
          totalLiquidity,
          isFrozen,
          decimals,
          debtCeiling,
          isolationModeTotalDebt,
        },
        underlyingAsset,
        minRemainingBaseTokenBalance,
      ),
    [
      walletBalance,
      supplyCap,
      totalLiquidity,
      isFrozen,
      decimals,
      debtCeiling,
      isolationModeTotalDebt,
      underlyingAsset,
      minRemainingBaseTokenBalance,
    ],
  );

  const handleChange = (value: string) => {
    if (value === "-1") {
      setAmount(maxAmountToSupply);
    } else {
      const decimalTruncatedValue = roundToTokenDecimals(
        value,
        poolReserve.decimals,
      );
      setAmount(decimalTruncatedValue);
    }
  };

  // Calculation of future HF
  const amountIntEth = new BigNumber(amount).multipliedBy(
    poolReserve.formattedPriceInMarketReferenceCurrency,
  );
  // TODO: is it correct to ut to -1 if user doesnt exist?
  const amountInUsd = amountIntEth
    .multipliedBy(marketReferencePriceInUsd)
    .shiftedBy(-USD_DECIMALS);
  const totalCollateralMarketReferenceCurrencyAfter = user
    ? valueToBigNumber(user.totalCollateralMarketReferenceCurrency).plus(
        amountIntEth,
      )
    : "-1";

  const liquidationThresholdAfter = user
    ? valueToBigNumber(user.totalCollateralMarketReferenceCurrency)
        .multipliedBy(user.currentLiquidationThreshold)
        .plus(
          amountIntEth.multipliedBy(
            poolReserve.formattedReserveLiquidationThreshold,
          ),
        )
        .dividedBy(totalCollateralMarketReferenceCurrencyAfter)
    : "-1";

  const isMaxSelected = amount === maxAmountToSupply;

  let healthFactorAfterDeposit = user
    ? valueToBigNumber(user.healthFactor)
    : "-1";

  if (
    user &&
    ((!user.isInIsolationMode && !poolReserve.isIsolated) ||
      (user.isInIsolationMode &&
        user.isolatedReserve?.underlyingAsset === poolReserve.underlyingAsset))
  ) {
    healthFactorAfterDeposit = calculateHealthFactorFromBalancesBigUnits({
      collateralBalanceMarketReferenceCurrency:
        totalCollateralMarketReferenceCurrencyAfter,
      borrowBalanceMarketReferenceCurrency: valueToBigNumber(
        user.totalBorrowsMarketReferenceCurrency,
      ),
      currentLiquidationThreshold: liquidationThresholdAfter,
    });
  }

  // ************** Warnings **********
  // isolation warning
  const hasDifferentCollateral = user.userReservesData.find(
    (reserve) =>
      reserve.usageAsCollateralEnabledOnUser &&
      reserve.reserve.id !== poolReserve.id,
  );
  const showIsolationWarning: boolean =
    !user.isInIsolationMode &&
    poolReserve.isIsolated &&
    !hasDifferentCollateral &&
    (userReserve && userReserve.underlyingBalance !== "0"
      ? userReserve.usageAsCollateralEnabledOnUser
      : true);

  // token info to add to wallet
  const addToken: ERC20TokenType = {
    address: poolReserve.aTokenAddress,
    symbol: poolReserve.iconSymbol,
    decimals: poolReserve.decimals,
    aToken: true,
  };

  // collateralization state
  const collateralType = getAssetCollateralType(
    userReserve,
    user.totalCollateralUSD,
    user.isInIsolationMode,
    debtCeilingUsage.isMaxed,
  );

  const supplyActionsProps = {
    amountToSupply: amount,
    isWrongNetwork,
    poolAddress: supplyUnWrapped
      ? API_ETH_MOCK_ADDRESS
      : poolReserve.underlyingAsset,
    symbol: supplyUnWrapped
      ? currentNetworkConfig.baseAssetSymbol
      : poolReserve.symbol,
    blocked: false,
    decimals: poolReserve.decimals,
  };

  if (supplyTxState.success)
    return (
      <TxSuccessView
        action={<div>Supplied</div>}
        amount={amount}
        symbol={
          supplyUnWrapped
            ? currentNetworkConfig.baseAssetSymbol
            : poolReserve.symbol
        }
        addToken={addToken}
      />
    );

  //  all relevant vaiables that are used in the return statement
  //  are declared here

  const supplyCapWarningParams = { supplyCap: supplyCapUsage };
  const debtCeilingWarningParams = { debtCeiling: debtCeilingUsage };
  const warningSeverity = "warning";
  const assetInputValue = amount;
  const assetInputChangeHandler = handleChange;
  const assetInputUsdValue = amountInUsd.toString(10);
  const assetInputSymbol = supplyUnWrapped
    ? currentNetworkConfig.baseAssetSymbol
    : poolReserve.symbol;
  const assetInputAssets = [
    {
      balance: maxAmountToSupply,
      symbol: supplyUnWrapped
        ? currentNetworkConfig.baseAssetSymbol
        : poolReserve.symbol,
      iconSymbol: supplyUnWrapped
        ? currentNetworkConfig.baseAssetSymbol
        : poolReserve.iconSymbol,
    },
  ];
  const assetInputCapType = CapType.supplyCap;
  const assetInputIsMaxSelected = isMaxSelected;
  const assetInputDisabled = supplyTxState.loading;
  const assetInputMaxValue = maxAmountToSupply;
  const assetInputBalanceText = (
    <p className="teaser-voice text-primary">balance</p>
  );
  const assetInputEvent = {
    eventName: GENERAL.MAX_INPUT_SELECTION,
    eventParams: {},
  };

  return (
    <>
      {/* Isolation Warning */}
      {/* {showIsolationWarning && (
			<IsolationModeWarning asset={poolReserve.symbol} />
		 )} */}

      {/* Supply Cap Warning */}
      {supplyCapUsage.determineWarningDisplay({ supplyCap: supplyCapUsage })}

      {/* Debt Ceiling Warning */}
      {debtCeilingUsage.determineWarningDisplay({
        debtCeiling: debtCeilingUsage,
      })}

      {/* AMPL Warning */}
      {poolReserve.symbol === "AMPL" && (
        <Warning sx={{ mt: "16px", mb: "40px" }} severity="warning">
          {/* <AMPLWarning /> */}
        </Warning>
      )}

      {/* AAVE Warning */}
      {/* {process.env.NEXT_PUBLIC_ENABLE_STAKING === 'true' &&
			poolReserve.symbol === 'AAVE' &&
			isFeatureEnabled.staking(currentMarketData) && <AAVEWarning />} */}

      {/* SNX Warning */}
      {/* {poolReserve.symbol === "SNX" && maxAmountToSupply !== "0" && (
			<SNXWarning />
		 )} */}

      {/* Asset Input */}
      <AssetInput
        value={assetInputValue}
        onChange={assetInputChangeHandler}
        usdValue={assetInputUsdValue}
        symbol={assetInputSymbol}
        assets={assetInputAssets}
        capType={assetInputCapType}
        isMaxSelected={assetInputIsMaxSelected}
        disabled={assetInputDisabled}
        maxValue={assetInputMaxValue}
        balanceText={assetInputBalanceText}
        event={assetInputEvent}
        isCompound={isCompound}
        tokenBalance={currBal}
      />

      {/* Transaction Modal Details */}
      <TxModalDetails
        gasLimit={gasLimit}
        skipLoad={true}
        disabled={Number(amount) === 0}
      >
        {/* Supply APY */}
        {!isCompound && (
          <DetailsNumberLine
            description={<p className="teaser-voice">Supply APY</p>}
            value={isCompound ? compSupplyAPY : supplyApy}
            percent
          />
        )}

        {/* Incentives Line */}
        {!isCompound && (
          <DetailsIncentivesLine
            incentives={poolReserve.aIncentivesData}
            symbol={poolReserve.symbol}
          />
        )}

        {/* Collateral Line */}
        {!isCompound && (
          <DetailsCollateralLine collateralType={collateralType} />
        )}

        {/* Health Factor Line */}
        <DetailsHFLine
          visibleHfChange={!!amount}
          healthFactor={user ? user.healthFactor : "-1"}
          futureHealthFactor={healthFactorAfterDeposit.toString(10)}
        />
      </TxModalDetails>

      {/* Gas Estimation Error */}
      {txError && <GasEstimationError txError={txError} />}

      {/* Supply Actions */}
      <SupplyActions {...supplyActionsProps} modalTitle={modalTitle} />
    </>
  );
};
