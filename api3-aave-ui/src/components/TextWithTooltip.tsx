import { Box, BoxProps, IconButton, SvgIcon, Typography } from "@mui/material";
import { TypographyProps } from "@mui/material/Typography";
import {
  JSXElementConstructor,
  ReactElement,
  ReactNode,
  useState,
} from "react";

import { ContentWithTooltip } from "./ContentWithTooltip";
import { InfoOutlined } from "@mui/icons-material";

export interface TextWithTooltipProps extends TypographyProps {
  text?: ReactNode;
  icon?: ReactNode;
  iconSize?: number;
  iconColor?: string;
  iconMargin?: number;
  textColor?: string;
  // eslint-disable-next-line
  children?: ReactElement<any, string | JSXElementConstructor<any>>;
  wrapperProps?: BoxProps;
  event?: any;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

export const TextWithTooltip = ({
  text,
  icon,
  iconSize = 14,
  iconColor,
  iconMargin,
  children,
  wrapperProps: { sx: boxSx, ...boxRest } = {},
  event,
  open: openProp = false,
  setOpen: setOpenProp,
  ...rest
}: TextWithTooltipProps) => {
  const [open, setOpen] = useState(openProp);

  const toggleOpen = () => {
    if (setOpenProp) setOpenProp(!open);
    setOpen(!open);
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", ...boxSx }} {...boxRest}>
      {text && <h2 className="teaser-voice text-[--ink]">{text}</h2>}

      <ContentWithTooltip
        tooltipContent={<>{children}</>}
        open={open}
        setOpen={toggleOpen}
      >
        <IconButton
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: iconSize,
            height: iconSize,
            borderRadius: "50%",
            p: 0,
            minWidth: 0,
            ml: iconMargin || 0.5,
          }}
          onClick={() => {}}
        >
          <SvgIcon
            sx={{
              fontSize: iconSize,
              color: iconColor ? iconColor : open ? "info.main" : "text.muted",
              borderRadius: "50%",
              "&:hover": { color: iconColor || "info.main" },
            }}
          >
            {icon || <InfoOutlined />}
          </SvgIcon>
        </IconButton>
      </ContentWithTooltip>
    </Box>
  );
};
