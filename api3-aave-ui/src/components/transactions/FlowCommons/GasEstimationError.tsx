import { Button, Typography } from "@mui/material";
import { Warning } from "src/components/primitives/Warning";
import { TxErrorType } from "src/ui-config/errorMapping";

export const GasEstimationError = ({ txError }: { txError: TxErrorType }) => {
  return (
    <div className="gas-estimation-error">
      <div>
        {txError.error ? (
          <>
            {txError.error}{" "}
            <Button
              sx={{ verticalAlign: "top" }}
              variant="text"
              onClick={() =>
                navigator.clipboard.writeText(
                  txError.rawError.message.toString(),
                )
              }
            >
              <p className="whisper-voice">copy the error</p>
            </Button>
          </>
        ) : (
          <div>
            <p className="whisper-voice error">
              There was some error. Please try changing the parameters.
            </p>
            <Button
              sx={{ verticalAlign: "top" }}
              onClick={() =>
                navigator.clipboard.writeText(
                  txError.rawError.message.toString(),
                )
              }
            >
              <p className="green text">copy the error</p>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
