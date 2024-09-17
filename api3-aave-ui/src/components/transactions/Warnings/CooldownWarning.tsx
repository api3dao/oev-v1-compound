import { Typography } from "@mui/material";

import { Warning } from "../../primitives/Warning";
import Link from "next/link";

export const CooldownWarning = () => {
  return (
    <Warning severity="warning" sx={{ ".MuiAlert-message": { p: 0 }, mb: 6 }}>
      <Typography variant="subheader1">
        <div>Cooldown period warning</div>
      </Typography>
      <Typography variant="caption">
        <div>
          The cooldown period is the time required prior to unstaking your
          tokens (20 days). You can only withdraw your assets from the Security
          Module after the cooldown period and within the unstake window.
          {/* todo: link to warning details doc */}
          <Link
            target="_blank"
            href="https://phantazm.gitbook.io/phantazm-1/v2/staking-mechanism-soon"
          >
            <div>Learn more</div>
          </Link>
        </div>
      </Typography>
    </Warning>
  );
};
