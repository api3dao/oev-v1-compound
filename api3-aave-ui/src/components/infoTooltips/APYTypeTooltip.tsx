// import { Trans } from '@lingui/macro';

import { TextWithTooltip, TextWithTooltipProps } from "../TextWithTooltip";

export const APYTypeTooltip = ({ ...rest }: TextWithTooltipProps) => {
  return (
    <TextWithTooltip {...rest}>
      <p>
        Allows you to switch between <strong>variable</strong> and{" "}
        <strong>stable</strong> interest rates, where variable rate can increase
        and decrease depending on the amount of liquidity in the reserve, and
        stable rate will stay the same for the duration of your loan.
      </p>
    </TextWithTooltip>
  );
};
