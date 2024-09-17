import { Box, BoxProps, CircularProgress, SvgIcon } from "@mui/material";
import { ReactNode } from "react";
import { TxStateType, useModalContext } from "src/hooks/useModal";
import { TxAction } from "src/ui-config/errorMapping";

import { ApprovalTooltip } from "../infoTooltips/ApprovalTooltip";
import { RightHelperText } from "./FlowCommons/RightHelperText";
import { Check } from "@mui/icons-material";

interface TxActionsWrapperProps extends BoxProps {
  actionInProgressText: ReactNode;
  actionText: ReactNode;
  amount?: string;
  approvalTxState?: TxStateType;
  handleApproval?: () => Promise<void>;
  handleAction: () => Promise<void>;
  isWrongNetwork: boolean;
  mainTxState: TxStateType;
  preparingTransactions: boolean;
  requiresAmount?: boolean;
  requiresApproval: boolean;
  symbol?: string;
  blocked?: boolean;
  fetchingData?: boolean;
  errorParams?: {
    loading: boolean;
    disabled: boolean;
    content: ReactNode;
    handleClick: () => Promise<void>;
  };
  tryPermit?: boolean;
  event?: any;
}

export const TxActionsWrapper = ({
  actionInProgressText,
  actionText,
  amount,
  approvalTxState,
  handleApproval,
  handleAction,
  isWrongNetwork,
  mainTxState,
  preparingTransactions,
  requiresAmount,
  requiresApproval,
  sx,
  symbol,
  blocked,
  fetchingData = false,
  errorParams,
  tryPermit,
  event,
  ...rest
}: TxActionsWrapperProps) => {
  const { txError } = useModalContext();

  const hasApprovalError =
    requiresApproval &&
    txError?.txAction === TxAction.APPROVAL &&
    txError?.actionBlocked;
  const isAmountMissing =
    requiresAmount && requiresAmount && Number(amount) === 0;

  function getMainParams() {
    if (blocked) return { disabled: true, content: actionText };
    if (
      (txError?.txAction === TxAction.GAS_ESTIMATION ||
        txError?.txAction === TxAction.MAIN_ACTION) &&
      txError?.actionBlocked
    ) {
      if (errorParams) return errorParams;
      return { loading: false, disabled: true, content: actionText };
    }
    if (isWrongNetwork)
      return { disabled: true, content: <span>Wrong Network</span> };
    if (fetchingData)
      return { disabled: true, content: <span>Fetching data...</span> };
    if (isAmountMissing)
      return { disabled: true, content: <span>Enter an amount</span> };
    if (preparingTransactions) return { disabled: true, loading: true };

    if (mainTxState?.loading)
      return { loading: true, disabled: true, content: actionInProgressText };
    if (requiresApproval && !approvalTxState?.success)
      return { disabled: true, content: actionText };
    return { content: actionText, handleClick: handleAction };
  }

  function getApprovalParams() {
    if (
      !requiresApproval ||
      isWrongNetwork ||
      isAmountMissing ||
      preparingTransactions ||
      hasApprovalError
    )
      return null;
    if (approvalTxState?.loading)
      return {
        loading: true,
        disabled: true,
        content: <span>Approving {symbol}...</span>,
      };
    if (approvalTxState?.success)
      return {
        disabled: true,
        content: (
          <>
            <span>Approve Confirmed</span>
            <SvgIcon sx={{ fontSize: 20, ml: 2 }}>
              <Check />
            </SvgIcon>
          </>
        ),
      };

    return {
      content: (
        <ApprovalTooltip
          variant="buttonL"
          iconSize={20}
          iconMargin={2}
          color="white"
          text={<p>Approve {symbol} to continue</p>}
        />
      ),
      handleClick: handleApproval,
    };
  }

  const { content, disabled, loading, handleClick } = getMainParams();
  const approvalParams = getApprovalParams();
  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", mt: 12, ...sx }}
      {...rest}
    >
      {requiresApproval && (
        <Box
          sx={{ display: "flex", justifyContent: "end", alignItems: "center" }}
        >
          <RightHelperText
            approvalHash={approvalTxState?.txHash}
            tryPermit={tryPermit}
          />
        </Box>
      )}

      {approvalParams && (
        <button
          disabled={approvalParams.disabled || blocked}
          className="button"
          onClick={() =>
            approvalParams.handleClick && approvalParams.handleClick()
          }
          data-cy="approvalButton"
        >
          {approvalParams.loading && (
            <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />
          )}
          {approvalParams.content}
        </button>
      )}

      <button
        disabled={disabled || blocked}
        className="button"
        onClick={handleClick}
        data-cy="actionButton"
      >
        {loading && (
          <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />
        )}
        {content}
      </button>
    </Box>
  );
};
