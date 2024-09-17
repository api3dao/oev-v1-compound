import { ProtocolAction } from "contract-helpers";
import { Reward } from "src/helpers/types";
import { useTransactionHandler } from "src/helpers/useTransactionHandler";
import { useRootStore } from "src/store/root";

import { TxActionsWrapper } from "../TxActionsWrapper";

export type ClaimRewardsActionsProps = {
  isWrongNetwork: boolean;
  blocked: boolean;
  selectedReward: Reward;
};

export const ClaimRewardsActions = ({
  isWrongNetwork,
  blocked,
  selectedReward,
}: ClaimRewardsActionsProps) => {
  const claimRewards = useRootStore((state) => state.claimRewards);

  const { action, loadingTxns, mainTxState, requiresApproval } =
    useTransactionHandler({
      protocolAction: ProtocolAction.claimRewards,
      eventTxInfo: {
        assetName: selectedReward.symbol,
        amount: selectedReward.balance,
      },
      tryPermit: false,
      handleGetTxns: async () => {
        return claimRewards({ isWrongNetwork, blocked, selectedReward });
      },
      skip: Object.keys(selectedReward).length === 0 || blocked,
      deps: [selectedReward],
    });

  return (
    <TxActionsWrapper
      requiresApproval={requiresApproval}
      blocked={blocked}
      preparingTransactions={loadingTxns}
      mainTxState={mainTxState}
      handleAction={action}
      actionText={
        selectedReward.symbol === "all" ? (
          <div>Claim all</div>
        ) : (
          <div>Claim {selectedReward.symbol}</div>
        )
      }
      actionInProgressText={<div>Claiming</div>}
      isWrongNetwork={isWrongNetwork}
    />
  );
};
