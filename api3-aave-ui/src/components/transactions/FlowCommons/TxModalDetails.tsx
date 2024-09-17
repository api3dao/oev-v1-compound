import { ReserveIncentiveResponse } from "@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import {
  Box,
  FormControlLabel,
  Skeleton,
  SvgIcon,
  Switch,
  Typography,
} from "@mui/material";
import { parseUnits } from "ethers/lib/utils";
import React, { ReactNode } from "react";
import {
  IsolatedDisabledBadge,
  IsolatedEnabledBadge,
  UnavailableDueToIsolationBadge,
} from "src/components/isolationMode/IsolatedBadge";
import { Row } from "src/components/primitives/Row";
import { CollateralType } from "src/helpers/types";

import { HealthFactorNumber } from "../../HealthFactorNumber";
// import { IncentivesButton } from "../../incentives/IncentivesButton";
import {
  FormattedNumber,
  FormattedNumberProps,
} from "../../primitives/FormattedNumber";
import { TokenIcon } from "../../primitives/TokenIcon";
import { GasStation } from "../GasStation/GasStation";

export interface TxModalDetailsProps {
  gasLimit?: string;
  slippageSelector?: ReactNode;
  skipLoad?: boolean;
  disabled?: boolean;
  children?: any;
}

const ArrowRightIcon = (
  <SvgIcon color="primary" sx={{ fontSize: "14px", mx: 1 }}>
    <ArrowRightAltIcon />
  </SvgIcon>
);

export const TxModalDetails: React.FC<TxModalDetailsProps> = ({
  gasLimit,
  slippageSelector,
  skipLoad,
  disabled,
  children,
}) => {
  return (
    <Box sx={{ pt: 5 }}>
      <h2 className="firm-voice mb-4">Transaction overview</h2>

      <div className="grid gap-4">{children}</div>

      {/*  */}
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <GasStation
          gasLimit={parseUnits(gasLimit || "0", "wei")}
          skipLoad={skipLoad}
          disabled={disabled}
        />
        {slippageSelector}
      </Box>
    </Box>
  );
};

interface DetailsNumberLineProps extends FormattedNumberProps {
  description: ReactNode;
  value: FormattedNumberProps["value"];
  futureValue?: FormattedNumberProps["value"];
  numberPrefix?: ReactNode;
  iconSymbol?: string;
  loading?: boolean;
}

export const DetailsNumberLine = ({
  description,
  value,
  futureValue,
  numberPrefix,
  iconSymbol,
  loading = false,
  ...rest
}: DetailsNumberLineProps) => {
  return (
    <div className="flex justify-between">
      <p className="teaser-voice">{description}</p>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {loading ? (
          <Skeleton
            variant="rectangular"
            height={20}
            width={100}
            sx={{ borderRadius: "4px" }}
          />
        ) : (
          <p className="solid-voice">
            {iconSymbol && (
              <TokenIcon symbol={iconSymbol} sx={{ mr: 1, fontSize: "16px" }} />
            )}
            {numberPrefix && (
              <Typography sx={{ mr: 1 }}>{numberPrefix}</Typography>
            )}
            <FormattedNumber value={value} variant="secondary14" {...rest} />
            {futureValue && (
              <>
                {ArrowRightIcon}
                <FormattedNumber
                  value={futureValue}
                  variant="secondary14"
                  {...rest}
                />
              </>
            )}
          </p>
        )}
      </Box>
    </div>
  );
};

interface DetailsNumberLineWithSubProps {
  description: ReactNode;
  symbol: ReactNode;
  value?: string;
  valueUSD?: string;
  futureValue: string;
  futureValueUSD: string;
  hideSymbolSuffix?: boolean;
  color?: string;
  tokenIcon?: string;
  loading?: boolean;
}

export const DetailsNumberLineWithSub = ({
  description,
  symbol,
  value,
  valueUSD,
  futureValue,
  futureValueUSD,
  hideSymbolSuffix,
  color,
  tokenIcon,
  loading = false,
}: DetailsNumberLineWithSubProps) => {
  return (
    <Row
      caption={description}
      captionVariant="description"
      mb={4}
      align="flex-start"
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
        }}
      >
        {loading ? (
          <>
            <Skeleton
              variant="rectangular"
              height={20}
              width={100}
              sx={{ borderRadius: "4px" }}
            />
            <Skeleton
              variant="rectangular"
              height={15}
              width={80}
              sx={{ borderRadius: "4px", marginTop: "4px" }}
            />
          </>
        ) : (
          <p className="solid-voice">
            <div className="flex items-center justify-between">
              {value && (
                <>
                  <FormattedNumber
                    value={value}
                    variant="secondary14"
                    color={color}
                  />
                  {!hideSymbolSuffix && (
                    <Typography ml={1} variant="secondary14">
                      {symbol}
                    </Typography>
                  )}
                  {ArrowRightIcon}
                </>
              )}
              {tokenIcon && (
                <TokenIcon
                  symbol={tokenIcon}
                  sx={{ mr: 1, fontSize: "14px" }}
                />
              )}
              <FormattedNumber
                value={futureValue}
                variant="secondary14"
                color={color}
              />
              {!hideSymbolSuffix && (
                <Typography ml={1} variant="secondary14">
                  {symbol}
                </Typography>
              )}
            </div>
            <div className="flex items-center justify-between">
              {valueUSD && (
                <>
                  <FormattedNumber
                    value={valueUSD}
                    variant="helperText"
                    compact
                    symbol="USD"
                  />
                  {ArrowRightIcon}
                </>
              )}
              <FormattedNumber
                value={futureValueUSD}
                variant="helperText"
                compact
                symbol="USD"
              />
            </div>
          </p>
        )}
      </Box>
    </Row>
  );
};

export interface DetailsCollateralLine {
  collateralType: CollateralType;
}

export const DetailsCollateralLine = ({
  collateralType,
}: DetailsCollateralLine) => {
  return (
    <Row
      caption={<p className="teaser-voice">Collateralization</p>}
      captionVariant="description"
    >
      <CollateralState collateralType={collateralType} />
    </Row>
  );
};

interface CollateralStateProps {
  collateralType: CollateralType;
}

export const CollateralState = ({ collateralType }: CollateralStateProps) => {
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center" }}>
      {
        {
          [CollateralType.ENABLED]: (
            <Typography variant="description" color="success.main">
              <p className="solid-voice">Enabled</p>
            </Typography>
          ),
          [CollateralType.ISOLATED_ENABLED]: (
            <IsolatedEnabledBadge
              typographyProps={{
                variant: "description",
                color: "warning.main",
              }}
            />
          ),
          [CollateralType.DISABLED]: (
            <Typography variant="description" color="error.main">
              <p className="solid-voice">Disabled</p>
            </Typography>
          ),
          [CollateralType.UNAVAILABLE]: (
            <Typography variant="description" color="error.main">
              <p className="solid-voice">Unavailable</p>
            </Typography>
          ),
          [CollateralType.ISOLATED_DISABLED]: <IsolatedDisabledBadge />,
          [CollateralType.UNAVAILABLE_DUE_TO_ISOLATION]: (
            <UnavailableDueToIsolationBadge />
          ),
        }[collateralType]
      }
    </Box>
  );
};

interface DetailsIncentivesLineProps {
  futureIncentives?: ReserveIncentiveResponse[];
  futureSymbol?: string;
  incentives?: ReserveIncentiveResponse[];
  // the token yielding the incentive, not the incentive itself
  symbol: string;
  loading?: boolean;
}

export const DetailsIncentivesLine = ({
  incentives,
  symbol,
  futureIncentives,
  futureSymbol,
  loading = false,
}: DetailsIncentivesLineProps) => {
  if (
    !incentives ||
    incentives.filter((i) => i.incentiveAPR !== "0").length === 0
  )
    return null;
  return (
    <Row
      caption={<p>Rewards APR</p>}
      captionVariant="description"
      mb={4}
      minHeight={24}
    >
      {/* <Box sx={{ display: "flex", alignItems: "center" }}>
        {loading ? (
          <Skeleton
            variant="rectangular"
            height={20}
            width={100}
            sx={{ borderRadius: "4px" }}
          />
        ) : (
          <>
            <IncentivesButton incentives={incentives} symbol={symbol} />
            {futureSymbol && (
              <>
                {ArrowRightIcon}
                <IncentivesButton
                  incentives={futureIncentives}
                  symbol={futureSymbol}
                />
                {futureIncentives && futureIncentives.length === 0 && (
                  <Typography variant="secondary14">
                    <div>None</div>
                  </Typography>
                )}
              </>
            )}
          </>
        )}
      </Box> */}
    </Row>
  );
};

export interface DetailsHFLineProps {
  healthFactor: string;
  futureHealthFactor: string;
  visibleHfChange: boolean;
  loading?: boolean;
}

export const DetailsHFLine = ({
  healthFactor,
  futureHealthFactor,
  visibleHfChange,
  loading = false,
}: DetailsHFLineProps) => {
  if (healthFactor === "-1" && futureHealthFactor === "-1") return null;
  return (
    <Row
      caption={<p className="teaser-voice">Health factor</p>}
      captionVariant="description"
      mb={4}
      align="flex-start"
    >
      <Box sx={{ textAlign: "right" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          {loading ? (
            <Skeleton
              variant="rectangular"
              height={20}
              width={80}
              sx={{ borderRadius: "4px" }}
            />
          ) : (
            <p className="solid-voice">
              <HealthFactorNumber value={healthFactor} variant="secondary14" />

              {visibleHfChange && (
                <>
                  {ArrowRightIcon}

                  <HealthFactorNumber
                    value={
                      isNaN(Number(futureHealthFactor))
                        ? healthFactor
                        : futureHealthFactor
                    }
                    variant="secondary14"
                  />
                </>
              )}
            </p>
          )}
        </Box>

        <p className="whisper-voice text-primary">
          Liquidation at
          <span>{" <1.0"}</span>
        </p>
      </Box>
    </Row>
  );
};

export interface DetailsUnwrapSwitchProps {
  unwrapped: boolean;
  setUnWrapped: (value: boolean) => void;
  label: ReactNode;
}

export const DetailsUnwrapSwitch = ({
  unwrapped,
  setUnWrapped,
  label,
}: DetailsUnwrapSwitchProps) => {
  return (
    <Row captionVariant="description" sx={{ mt: 5 }}>
      <FormControlLabel
        sx={{ mx: 0 }}
        control={
          <Switch
            disableRipple
            checked={unwrapped}
            onClick={() => setUnWrapped(!unwrapped)}
            data-cy={"wrappedSwitcher"}
          />
        }
        labelPlacement="end"
        label={label}
      />
    </Row>
  );
};
