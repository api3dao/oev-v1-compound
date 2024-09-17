import { Close } from "@mui/icons-material";
import { Box, IconButton, Modal, Paper, SvgIcon } from "@mui/material";
import React from "react";

export interface BasicModalProps {
  open: boolean;
  children: React.ReactNode;
  setOpen: (value: boolean) => void;
  withCloseButton?: boolean;
  contentMaxWidth?: number;
}

export const BasicModal = ({
  open,
  setOpen,
  withCloseButton = true,
  contentMaxWidth = 420,
  children,
  ...props
}: BasicModalProps) => {
  const handleClose = () => setOpen(false);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        ".MuiPaper-root": {
          outline: "none",
        },
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
      {...props}
      data-cy={"Modal"}
    >
      <Paper
        sx={{
          display: "grid",
          gap: "var(--space-xs)",
          position: "relative",
          margin: "10px",
          overflowY: "auto",
          width: "100%",
          maxWidth: { xs: "500px", xsm: `${contentMaxWidth}px` },
          maxHeight: "calc(100vh - 20px)",
          p: 6,
          background: "var(--paper)",
          color: "var(--ink)",
        }}
      >
        {children}

        {withCloseButton && (
          <Box
            sx={{ position: "absolute", top: "24px", right: "50px", zIndex: 5 }}
          >
            <IconButton
              sx={{
                borderRadius: "50%",
                p: 0,
                minWidth: 0,
                position: "absolute",
              }}
              onClick={handleClose}
              data-cy={"close-button"}
            >
              <SvgIcon
                sx={{
                  fontSize: "28px",
                  color: "var(--color)",
                }}
              >
                <Close />
              </SvgIcon>
            </IconButton>
          </Box>
        )}
      </Paper>
    </Modal>
  );
};
