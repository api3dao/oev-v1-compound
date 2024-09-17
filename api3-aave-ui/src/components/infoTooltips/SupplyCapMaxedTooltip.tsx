// import { ExclamationIcon } from '@heroicons/react/outline';
// import { Trans } from '@lingui/macro';
import { Box } from "@mui/material";
import { AssetCapData } from "src/hooks/useAssetCaps";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";

import { Link } from "../primitives/Link";
import { TextWithTooltip, TextWithTooltipProps } from "../TextWithTooltip";

type SupplyCapMaxedTooltipProps = TextWithTooltipProps & {
  supplyCap: AssetCapData;
};

export const SupplyCapMaxedTooltip = ({
  supplyCap,
  ...rest
}: SupplyCapMaxedTooltipProps) => {
  if (!supplyCap || !supplyCap.isMaxed) return null;

  return (
    <Box sx={{ ml: 2 }}>
      <TextWithTooltip
        {...rest}
        icon={<PriorityHighIcon />}
        iconColor="warning.main"
        iconSize={18}
      >
        <>
          <div>
            Protocol supply cap at 100% for this asset. Further supply
            unavailable.
          </div>{" "}
          <Link
            href="https://docs.aave.com/developers/whats-new/supply-borrow-caps"
            underline="always"
          >
            <div>Learn more</div>
          </Link>
        </>
      </TextWithTooltip>
    </Box>
  );
};
