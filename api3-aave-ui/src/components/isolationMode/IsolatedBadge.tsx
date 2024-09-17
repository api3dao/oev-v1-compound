// import { InformationCircleIcon } from '@heroicons/react/outline';
// import { Trans } from '@lingui/macro';
import InfoIcon from "@mui/icons-material/Info";
import { Box, Link, SvgIcon, Typography, TypographyProps } from "@mui/material";
import { ReactNode } from "react";

import { ContentWithTooltip } from "../ContentWithTooltip";

const contentSx = {
  display: "inline-flex",
  alignItems: "center",
  p: "2px",
  mt: "2px",
  cursor:
    "url(https://cdn.custom-cursor.com/db/16135/32/starter-colorful-drops-pointer.png), pointer",
  "&:hover": { opacity: 0.6 },
};

const InfoIconSvg = () => (
  <SvgIcon
    sx={{
      ml: "3px",
      color: "text.muted",
      fontSize: "14px",
    }}
  >
    <InfoIcon />
  </SvgIcon>
);
export const IsolatedEnabledBadge = ({
  typographyProps,
}: {
  typographyProps?: TypographyProps;
}) => {
  return (
    <ContentWithTooltip
      withoutHover
      tooltipContent={
        <IsolationModeTooltipTemplate
          content={
            <div>
              Isolated assets have limited borrowing power and other assets
              cannot be used as collateral.
            </div>
          }
        />
      }
    >
      <Box sx={contentSx}>
        <Typography
          variant="secondary12"
          color="text.secondary"
          {...typographyProps}
        >
          <div>Isolated</div>
        </Typography>
        <InfoIcon />
      </Box>
    </ContentWithTooltip>
  );
};

export const IsolatedDisabledBadge = () => {
  return (
    <ContentWithTooltip
      tooltipContent={
        <IsolationModeTooltipTemplate
          content={
            <div>
              Asset can be only used as collateral in isolation mode with
              limited borrowing power. To enter isolation mode, disable all
              other collateral.
            </div>
          }
        />
      }
    >
      <Box sx={contentSx}>
        <Typography variant="description" color="error.main">
          <div>Unavailable</div>
        </Typography>
        <InfoIconSvg />
      </Box>
    </ContentWithTooltip>
  );
};

export const UnavailableDueToIsolationBadge = () => {
  return (
    <ContentWithTooltip
      tooltipContent={
        <IsolationModeTooltipTemplate
          content={
            <div>Collateral usage is limited because of isolation mode.</div>
          }
        />
      }
    >
      <Box sx={contentSx}>
        <Typography variant="description" color="error.main">
          <div>Unavailable</div>
        </Typography>
        <InfoIcon />
      </Box>
    </ContentWithTooltip>
  );
};

const IsolationModeTooltipTemplate = ({ content }: { content: ReactNode }) => {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>{content}</Box>
      <Typography variant="subheader2" color="text.secondary">
        <div>
          Learn more in our{" "}
          <Link
            href="https://docs.aave.com/faq/aave-v3-features#isolation-mode"
            fontWeight={500}
          >
            FAQ guide
          </Link>
        </div>
      </Typography>
    </Box>
  );
};
