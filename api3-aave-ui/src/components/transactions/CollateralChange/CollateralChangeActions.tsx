import { ProtocolAction } from "contract-helpers";
import { useTransactionHandler } from "src/helpers/useTransactionHandler";
import { ComputedReserveData } from "src/hooks/app-data-provider/useAppDataProvider";
import { useRootStore } from "src/store/root";

import { TxActionsWrapper } from "../TxActionsWrapper";

export type CollateralChangeActionsProps = {
  poolReserve: ComputedReserveData;
  isWrongNetwork: boolean;
  usageAsCollateral: boolean;
  blocked: boolean;
  symbol: string;
};

export const CollateralChangeActions = ({
  poolReserve,
  isWrongNetwork,
  usageAsCollateral,
  blocked,
  symbol,
}: CollateralChangeActionsProps) => {
  const setUsageAsCollateral = useRootStore(
    (state) => state.setUsageAsCollateral,
  );

  const { action, loadingTxns, mainTxState, requiresApproval } =
    useTransactionHandler({
      tryPermit: false,
      protocolAction: ProtocolAction.setUsageAsCollateral,
      eventTxInfo: {
        assetName: poolReserve.name,
        asset: poolReserve.underlyingAsset,
        previousState: (!usageAsCollateral).toString(),
        newState: usageAsCollateral.toString(),
      },

      handleGetTxns: async () => {
        return setUsageAsCollateral({
          reserve: poolReserve.underlyingAsset,
          usageAsCollateral,
        });
      },
      skip: blocked,
    });

  return (
    <TxActionsWrapper
      requiresApproval={requiresApproval}
      blocked={blocked}
      preparingTransactions={loadingTxns}
      mainTxState={mainTxState}
      isWrongNetwork={isWrongNetwork}
      actionText={
        usageAsCollateral ? (
          <div>Enable {symbol} as collateral</div>
        ) : (
          <div>Disable {symbol} as collateral</div>
        )
      }
      actionInProgressText={<div>Pending...</div>}
      handleAction={action}
    />
  );
};
