import { Check } from "@mui/icons-material";
import {
  Box,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  SvgIcon,
  Typography,
} from "@mui/material";
import * as React from "react";
import { ApprovalMethod } from "src/store/walletSlice";

interface ApprovalMethodToggleButtonProps {
  currentMethod: ApprovalMethod;
  setMethod: (newMethod: ApprovalMethod) => void;
}

export const ApprovalMethodToggleButton = ({
  currentMethod,
  setMethod,
}: ApprovalMethodToggleButtonProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Box
        onClick={handleClick}
        sx={{
          display: "flex",
          alignItems: "center",
          cursor:
            "url(https://cdn.custom-cursor.com/db/16135/32/starter-colorful-drops-pointer.png), pointer",
        }}
        data-cy={`approveButtonChange`}
      >
        <Typography variant="subheader2" color="info.main">
          <div>{currentMethod}</div>
        </Typography>
        <SvgIcon sx={{ fontSize: 16, ml: 1, color: "info.main" }}>
          {/* <CogIcon /> */}
        </SvgIcon>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
        keepMounted={true}
        data-cy={`approveMenu_${currentMethod}`}
      >
        <MenuItem
          data-cy={`approveOption_${ApprovalMethod.PERMIT}`}
          selected={currentMethod === ApprovalMethod.PERMIT}
          value={ApprovalMethod.PERMIT}
          onClick={() => {
            if (currentMethod === ApprovalMethod.APPROVE) {
              setMethod(ApprovalMethod.PERMIT);
            }
            handleClose();
          }}
        >
          <ListItemText primaryTypographyProps={{ variant: "subheader1" }}>
            <div>{ApprovalMethod.PERMIT}</div>
          </ListItemText>
          <ListItemIcon>
            <SvgIcon>
              {currentMethod === ApprovalMethod.PERMIT && <Check />}
            </SvgIcon>
          </ListItemIcon>
        </MenuItem>

        <MenuItem
          data-cy={`approveOption_${ApprovalMethod.APPROVE}`}
          selected={currentMethod === ApprovalMethod.APPROVE}
          value={ApprovalMethod.APPROVE}
          onClick={() => {
            if (currentMethod === ApprovalMethod.PERMIT) {
              setMethod(ApprovalMethod.APPROVE);
            }
            handleClose();
          }}
        >
          <ListItemText primaryTypographyProps={{ variant: "subheader1" }}>
            <div>{ApprovalMethod.APPROVE}</div>
          </ListItemText>
          <ListItemIcon>
            <SvgIcon>
              {currentMethod === ApprovalMethod.APPROVE && <Check />}
            </SvgIcon>
          </ListItemIcon>
        </MenuItem>
      </Menu>
    </>
  );
};
