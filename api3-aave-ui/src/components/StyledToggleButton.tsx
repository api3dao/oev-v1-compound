import { styled, ToggleButton, ToggleButtonProps } from "@mui/material";
import React from "react";

const CustomToggleButton = styled(ToggleButton)<ToggleButtonProps>(
  ({ theme }) => ({
    border: "0px",
    flex: 1,
    //  backgroundColor: "#383D51",
    borderRadius: "var(--corners)",

    "&.Mui-selected, &.Mui-selected:hover": {
      borderRadius: "var(--corners) !important",
    },

    "&.Mui-selected, &.Mui-disabled": {
      zIndex: 100,
      height: "100%",
      display: "flex",
      justifyContent: "center",
      color: "var(--color)",
      filter: "brightness(1.2) !important",
    },
  }),
) as typeof ToggleButton;

const CustomTxModalToggleButton = styled(ToggleButton)<ToggleButtonProps>(
  ({ theme }) => ({
    border: "0px",
    flex: 1,
    color: theme.palette.text.muted,
    borderRadius: "var(--corners)",

    "&.Mui-selected, &.Mui-selected:hover": {
      border: `1px solid ${theme.palette?.other?.standardInputLine}`,
      borderRadius: "var(--corners) !important",
    },

    "&.Mui-selected, &.Mui-disabled": {
      zIndex: 100,
      height: "100%",
      display: "flex",
      justifyContent: "center",
      color: "var(--color)",
      filter: "brightness(1.2) !important",
    },
  }),
) as typeof ToggleButton;

export function StyledTxModalToggleButton(props: ToggleButtonProps) {
  return <CustomTxModalToggleButton {...props} />;
}

export default function StyledToggleButton(props: ToggleButtonProps) {
  return <CustomToggleButton {...props} />;
}
