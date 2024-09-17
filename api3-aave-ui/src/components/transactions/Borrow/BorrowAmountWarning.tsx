import { Box, Checkbox, Typography } from "@mui/material";
import { Warning } from "src/components/primitives/Warning";

interface BorrowAmountWarningProps {
  riskCheckboxAccepted: boolean;
  onRiskCheckboxChange: () => void;
}

export const BorrowAmountWarning = ({
  riskCheckboxAccepted,
  onRiskCheckboxChange,
}: BorrowAmountWarningProps) => {
  return (
    <>
      <Warning severity="error" sx={{ my: 6 }}>
        <div>
          Borrowing this amount will reduce your health factor and increase risk
          of liquidation.
        </div>
      </Warning>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          mx: "24px",
          mb: "12px",
        }}
      >
        <Checkbox
          checked={riskCheckboxAccepted}
          onChange={(event) => {
            onRiskCheckboxChange();
          }}
          style={{ color: "#ffffff" }}
          size="small"
          data-cy={"risk-checkbox"}
        />
        <Typography variant="description">
          <div>I acknowledge the risks involved.</div>
        </Typography>
      </Box>
    </>
  );
};
