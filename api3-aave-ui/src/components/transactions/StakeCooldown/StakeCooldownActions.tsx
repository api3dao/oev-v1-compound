import { ProtocolAction } from "contract-helpers";
import { BoxProps } from "@mui/material";
import { useRootStore } from "src/store/root";

import { useTransactionHandler } from "../../../helpers/useTransactionHandler";
import { TxActionsWrapper } from "../TxActionsWrapper";

export interface StakeCooldownActionsProps extends BoxProps {
  isWrongNetwork: boolean;
  customGasPrice?: string;
  blocked: boolean;
  selectedToken: string;
  amountToCooldown: string;
}

export const StakeCooldownActions = ({
  isWrongNetwork,
  sx,
  blocked,
  selectedToken,
  amountToCooldown,
  ...props
}: StakeCooldownActionsProps) => {
  const cooldown = useRootStore((state) => state.cooldown);

  const { action, loadingTxns, mainTxState, requiresApproval } =
    useTransactionHandler({
      tryPermit: false,
      handleGetTxns: async () => {
        return cooldown(selectedToken);
      },
      skip: blocked,
      deps: [],
      protocolAction: ProtocolAction.stakeCooldown,
      eventTxInfo: {
        amount: amountToCooldown,
        assetName: selectedToken,
      },
    });

  return (
    <TxActionsWrapper
      requiresApproval={requiresApproval}
      blocked={blocked}
      preparingTransactions={loadingTxns}
      handleAction={action}
      actionText={<div>Activate Cooldown</div>}
      actionInProgressText={<div>Activate Cooldown</div>}
      mainTxState={mainTxState}
      isWrongNetwork={isWrongNetwork}
      sx={sx}
      {...props}
    />
  );
};
