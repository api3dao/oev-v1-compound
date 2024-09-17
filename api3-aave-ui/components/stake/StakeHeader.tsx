import { useMediaQuery, useTheme } from "@mui/material";
import Pane from "components/pane";
import React from "react";
import { FormattedNumber } from "src/components/primitives/FormattedNumber";

export default function StakeHeader({ tvl, stkEmission, loading }: any) {
  const theme = useTheme();
  const downToSM = useMediaQuery(theme.breakpoints.down("sm"));
  const valueTypographyVariant = downToSM ? "main16" : "main21";
  const symbolsVariant = downToSM ? "secondary16" : "secondary21";

  return (
    <section>
      <div className="inner-column">
        <h1 className="loud-voice gradient-text mb-4">Staking</h1>
        <div className="flex flex-wrap gap-12 p-2">
          <div className="grid gap-1">
            <h3 className="teaser-voice">Funds locked</h3>
            <p className="firm-voice text-primary">
              <FormattedNumber
                value={tvl}
                symbol="USD"
                variant={valueTypographyVariant}
                visibleDecimals={2}
                compact
                symbolsVariant={symbolsVariant}
              />
            </p>
          </div>

          <div className="grid gap-1">
            <h3 className="teaser-voice">Total emission per day</h3>

            <p className="firm-voice text-primary">
              <FormattedNumber
                value={stkEmission}
                symbol="USD"
                variant={valueTypographyVariant}
                visibleDecimals={2}
                compact
                symbolsVariant={symbolsVariant}
              />
            </p>
          </div>

          <div className="grid gap-1"></div>
        </div>
      </div>
    </section>
  );
}
