// import { ExclamationIcon } from '@heroicons/react/outline';
// import { Trans } from '@lingui/macro';
import { Box } from "@mui/material";
import { AssetCapData } from "src/hooks/useAssetCaps";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";

import { Link } from "../primitives/Link";
import { TextWithTooltip, TextWithTooltipProps } from "../TextWithTooltip";

type BorrowCapMaxedTooltipProps = TextWithTooltipProps & {
  borrowCap: AssetCapData;
};

export const BorrowCapMaxedTooltip = ({
  borrowCap,
  ...rest
}: BorrowCapMaxedTooltipProps) => {
  if (!borrowCap || !borrowCap.isMaxed) return null;

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
            Protocol borrow cap at 100% for this asset. Further borrowing
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
