// import { ExclamationIcon } from '@heroicons/react/outline';
// import { Trans } from '@lingui/macro';
import { Box } from "@mui/material";
import { AssetCapData } from "src/hooks/useAssetCaps";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";

import { Link } from "../primitives/Link";
import { TextWithTooltip, TextWithTooltipProps } from "../TextWithTooltip";

type DebtCeilingMaxedTooltipProps = TextWithTooltipProps & {
  debtCeiling: AssetCapData;
};

export const DebtCeilingMaxedTooltip = ({
  debtCeiling,
  ...rest
}: DebtCeilingMaxedTooltipProps) => {
  if (!debtCeiling || !debtCeiling.isMaxed) return null;

  return (
    <Box sx={{ ml: 2 }}>
      <TextWithTooltip
        {...rest}
        icon={<PriorityHighIcon />}
        iconColor="error.main"
        iconSize={18}
      >
        <>
          <div>
            Protocol debt ceiling is at 100% for this asset. Futher borrowing
            against this asset is unavailable.
          </div>{" "}
          <Link
            href="https://docs.aave.com/faq/aave-v3-features#how-does-isolation-mode-affect-my-borrowing-power"
            underline="always"
          >
            <div>Learn more</div>
          </Link>
        </>
      </TextWithTooltip>
    </Box>
  );
};
