import { ChainId } from "contract-helpers";
import { Button, Typography } from "@mui/material";

import { Warning } from "../../primitives/Warning";
import { useWeb3 } from "src/hooks/lib/useWeb3";

export type ChangeNetworkWarningProps = {
  funnel?: string;
  networkName: string;
  chainId: ChainId;
  event?: any;
};

export const ChangeNetworkWarning = ({
  networkName,
  chainId,
  event,
  funnel,
}: ChangeNetworkWarningProps) => {
  const { switchNetwork, switchNetworkError } = useWeb3();

  const handleSwitchNetwork = () => {
    switchNetwork?.(chainId);
  };
  return (
    <Warning severity="error" icon={false}>
      {switchNetworkError ? (
        <Typography>
          <div>
            Seems like we can&apos;t switch the network automatically. Please
            check if you can change it from the wallet.
          </div>
        </Typography>
      ) : (
        <Typography variant="description">
          <div>Please switch to {networkName}.</div>{" "}
          <Button
            variant="text"
            sx={{ ml: "2px", verticalAlign: "top" }}
            onClick={handleSwitchNetwork}
            disableRipple
          >
            <Typography variant="description">
              <div>Switch Network</div>
            </Typography>
          </Button>
        </Typography>
      )}
    </Warning>
  );
};
