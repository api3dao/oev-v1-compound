import { API_ETH_MOCK_ADDRESS, InterestRate } from "contract-helpers";
import {
  calculateHealthFactorFromBalancesBigUnits,
  USD_DECIMALS,
  valueToBigNumber,
} from "@aave/math-utils";
// import { Trans } from '@lingui/macro';
import { Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { APYTypeTooltip } from "src/components/infoTooltips/APYTypeTooltip";
import { FormattedNumber } from "src/components/primitives/FormattedNumber";
import { Row } from "src/components/primitives/Row";
import { StyledTxModalToggleButton } from "src/components/StyledToggleButton";
import { StyledTxModalToggleGroup } from "src/components/StyledToggleButtonGroup";
import { useAppDataContext } from "src/hooks/app-data-provider/useAppDataProvider";
import { useAssetCaps } from "src/hooks/useAssetCaps";
import { useModalContext } from "src/hooks/useModal";
import { useProtocolDataContext } from "src/hooks/useProtocolDataContext";
import { getMaxAmountAvailableToBorrow } from "src/utils/getMaxAmountAvailableToBorrow";
import { GENERAL } from "src/utils/mixPanelEvents";
import { roundToTokenDecimals } from "src/utils/utils";

import { CapType } from "../../caps/helper";
import { AssetInput } from "../AssetInput";
import { GasEstimationError } from "../FlowCommons/GasEstimationError";
import { ModalWrapperProps } from "../FlowCommons/ModalWrapper";
import { TxSuccessView } from "../FlowCommons/Success";
import {
  DetailsHFLine,
  DetailsIncentivesLine,
  DetailsUnwrapSwitch,
  TxModalDetails,
} from "../FlowCommons/TxModalDetails";
import { BorrowActions } from "./BorrowActions";
import { BorrowAmountWarning } from "./BorrowAmountWarning";
import { ParameterChangewarning } from "./ParameterChangewarning";
import { ERC20TokenType } from "src/hooks/lib/Web3Provider";
import { populateChainConfigs } from "configuration";

export enum ErrorType {
  STABLE_RATE_NOT_ENABLED,
  NOT_ENOUGH_LIQUIDITY,
  BORROWING_NOT_AVAILABLE,
  NOT_ENOUGH_BORROWED,
}

interface BorrowModeSwitchProps {
  interestRateMode: InterestRate;
  setInterestRateMode: (value: InterestRate) => void;
  variableRate: string;
  stableRate: string;
}

const BorrowModeSwitch = ({
  setInterestRateMode,
  interestRateMode,
  variableRate,
  stableRate,
}: BorrowModeSwitchProps) => {
  return (
    <Row
      caption={
        <APYTypeTooltip
          text={<span>Borrow APY rate</span>}
          key="APY type_modal"
          variant="description"
        />
      }
      captionVariant="description"
      mb={5}
      flexDirection="column"
      align="flex-start"
      captionColor="text.secondary"
    >
      <StyledTxModalToggleGroup
        color="primary"
        value={interestRateMode}
        exclusive
        onChange={(_, value) => setInterestRateMode(value)}
        sx={{ mt: 0.5 }}
      >
        <StyledTxModalToggleButton
          value={InterestRate.Variable}
          disabled={interestRateMode === InterestRate.Variable}
        >
          <Typography variant="buttonM" sx={{ mr: 1 }}>
            <div>Variable</div>
          </Typography>
          <FormattedNumber value={variableRate} percent variant="secondary14" />
        </StyledTxModalToggleButton>
        {/* <StyledTxModalToggleButton
          value={InterestRate.Stable}
          disabled={interestRateMode === InterestRate.Stable}
        >
          <Typography variant="buttonM" sx={{ mr: 1 }}>
            <div>Stable</div>
          </Typography>
          <FormattedNumber value={stableRate} percent variant="secondary14" />
        </StyledTxModalToggleButton> */}
      </StyledTxModalToggleGroup>
    </Row>
  );
};

export const BorrowModalContent = ({
  underlyingAsset,
  isWrongNetwork,
  poolReserve,
  userReserve,
  unwrap: borrowUnWrapped,
  setUnwrap: setBorrowUnWrapped,
  symbol,
}: ModalWrapperProps & {
  unwrap: boolean;
  setUnwrap: (unwrap: boolean) => void;
}) => {
  const { mainTxState: borrowTxState, gasLimit, txError } = useModalContext();
  const { user, marketReferencePriceInUsd, compoundState } =
    useAppDataContext();
  const { currentNetworkConfig } = useProtocolDataContext();
  const { borrowCap } = useAssetCaps();

  const [interestRateMode, setInterestRateMode] = useState<InterestRate>(
    InterestRate.Variable,
  );
  const [amount, setAmount] = useState("");
  const [riskCheckboxAccepted, setRiskCheckboxAccepted] = useState(false);

  const compoundConfig = populateChainConfigs();
  const isCompound = compoundConfig.currentMarket === "compound";

  console.log("withdraw asset ", {
    poolReserve,
    userReserve,
    symbol,
    underlyingAsset,
    compoundState,
  });

  const isBaseSupplied = useMemo(() => {
    if (!compoundState?.assetInfo?.baseInfo?.suppliedFormatted) {
      return false;
    }

    return compoundState?.assetInfo?.baseInfo?.suppliedFormatted > 0.0001
      ? true
      : false;
  }, [compoundState]);

  // const isBorrowCapacityAvailable = useMemo(() => {
  //   if (!compoundState?.assetInfo?.baseInfo?.borrowCapacityBase) {
  //     return false;
  //   }

  //   return compoundState?.assetInfo?.baseInfo?.borrowCapacityBase > 0
  //     ? true
  //     : false;
  // }, [compoundState]);

  // const isBaseBorrowed = useMemo(() => {
  //   if (!compoundState?.assetInfo?.baseInfo?.borrowedInBase) {
  //     return false;
  //   }

  //   return compoundState?.assetInfo?.baseInfo?.borrowedInBase > 0
  //     ? true
  //     : false;
  // }, [compoundState]);

  // supplied usdc amount or usdc borrow capacity
  const compoundSupplied = useMemo(() => {
    if (!compoundState?.assets) {
      return {};
    }

    if (compoundState?.assetInfo?.baseInfo?.address === underlyingAsset) {
      //: todo fix display usdc supplied  or usdc borrow capacity

      if (isBaseSupplied) {
        return compoundState?.assetInfo?.baseInfo?.suppliedFormatted;
      }

      return compoundState?.assetInfo?.baseInfo?.borrowCapacityBase;
    }

    const asset = compoundState?.assets?.find(
      (asset: any) => asset?.asset?.address === underlyingAsset,
    )?.asset?.supplied;
    return asset;

    // return compoundState?.assetInfo?.baseInfo?.suppliedFormatted;
  }, [compoundState, underlyingAsset, isBaseSupplied]);

  // amount calculations
  const maxAmountToBorrow = isCompound
    ? compoundSupplied
    : getMaxAmountAvailableToBorrow(poolReserve, user, interestRateMode);

  // We set this in a useEffect, so it doesn't constantly change when
  // max amount selected
  const handleChange = (_value: string) => {
    if (_value === "-1") {
      setAmount(maxAmountToBorrow);
    } else {
      const decimalTruncatedValue = roundToTokenDecimals(
        _value,
        poolReserve.decimals,
      );
      setAmount(decimalTruncatedValue);
    }
  };

  const isMaxSelected = amount === maxAmountToBorrow;

  // health factor calculations
  const amountToBorrowInUsd = valueToBigNumber(amount)
    .multipliedBy(poolReserve.formattedPriceInMarketReferenceCurrency)
    .multipliedBy(marketReferencePriceInUsd)
    .shiftedBy(-USD_DECIMALS);

  const newHealthFactor = calculateHealthFactorFromBalancesBigUnits({
    collateralBalanceMarketReferenceCurrency: user.totalCollateralUSD,
    borrowBalanceMarketReferenceCurrency: valueToBigNumber(
      user.totalBorrowsUSD,
    ).plus(amountToBorrowInUsd),
    currentLiquidationThreshold: user.currentLiquidationThreshold,
  });
  const displayRiskCheckbox =
    newHealthFactor.toNumber() < 1.5 && newHealthFactor.toString() !== "-1";

  // calculating input usd value
  const usdValue = valueToBigNumber(amount).multipliedBy(
    poolReserve.priceInUSD,
  );

  // error types handling
  let blockingError: ErrorType | undefined = undefined;
  if (
    interestRateMode === InterestRate.Stable &&
    !poolReserve.stableBorrowRateEnabled
  ) {
    blockingError = ErrorType.STABLE_RATE_NOT_ENABLED;
  } else if (
    interestRateMode === InterestRate.Stable &&
    userReserve?.usageAsCollateralEnabledOnUser &&
    valueToBigNumber(amount).lt(userReserve?.underlyingBalance || 0)
  ) {
    blockingError = ErrorType.NOT_ENOUGH_BORROWED;
  } else if (
    valueToBigNumber(amount).gt(poolReserve.formattedAvailableLiquidity)
  ) {
    blockingError = ErrorType.NOT_ENOUGH_LIQUIDITY;
  } else if (!poolReserve.borrowingEnabled) {
    blockingError = ErrorType.BORROWING_NOT_AVAILABLE;
  }

  // error render handling
  const handleBlocked = () => {
    switch (blockingError) {
      case ErrorType.BORROWING_NOT_AVAILABLE:
        return (
          <div>
            Borrowing is currently unavailable for {poolReserve.symbol}.
          </div>
        );
      case ErrorType.NOT_ENOUGH_BORROWED:
        return (
          <div>
            You can borrow this asset with a stable rate only if you borrow more
            than the amount you are supplying as collateral.
          </div>
        );
      case ErrorType.NOT_ENOUGH_LIQUIDITY:
        return (
          <>
            <div>
              There are not enough funds in the
              {poolReserve.symbol}
              reserve to borrow
            </div>
          </>
        );
      case ErrorType.STABLE_RATE_NOT_ENABLED:
        return <div>The Stable Rate is not enabled for this currency</div>;
      default:
        return null;
    }
  };

  // token info to add to wallet
  const addToken: ERC20TokenType = {
    address: underlyingAsset,
    symbol: poolReserve.iconSymbol,
    decimals: poolReserve.decimals,
  };

  const iconSymbol =
    borrowUnWrapped && poolReserve.isWrappedBaseAsset
      ? currentNetworkConfig.baseAssetSymbol
      : poolReserve.iconSymbol;

  if (borrowTxState.success)
    return (
      <TxSuccessView
        action={<div>Borrowed</div>}
        amount={amount}
        symbol={iconSymbol}
        addToken={
          borrowUnWrapped && poolReserve.isWrappedBaseAsset
            ? undefined
            : addToken
        }
      />
    );

  const incentive =
    interestRateMode === InterestRate.Stable
      ? poolReserve.sIncentivesData
      : poolReserve.vIncentivesData;
  return (
    <>
      {borrowCap.determineWarningDisplay({ borrowCap })}

      {poolReserve.stableBorrowRateEnabled && !isCompound && (
        <BorrowModeSwitch
          interestRateMode={interestRateMode}
          setInterestRateMode={setInterestRateMode}
          variableRate={poolReserve.variableBorrowAPY}
          stableRate={poolReserve.stableBorrowAPY}
        />
      )}

      <AssetInput
        value={amount}
        onChange={handleChange}
        usdValue={usdValue.toString(10)}
        assets={[
          {
            balance: maxAmountToBorrow,
            symbol,
            iconSymbol,
          },
        ]}
        symbol={symbol}
        capType={CapType.borrowCap}
        isMaxSelected={isMaxSelected}
        maxValue={maxAmountToBorrow}
        isCompound={isCompound}
        balanceText={<div>Available</div>}
        event={{
          eventName: GENERAL.MAX_INPUT_SELECTION,
          eventParams: {
            asset: poolReserve.underlyingAsset,
            assetName: poolReserve.name,
          },
        }}
      />

      {blockingError !== undefined && (
        <Typography variant="helperText" color="error.main">
          {handleBlocked()}
        </Typography>
      )}

      {poolReserve.isWrappedBaseAsset && (
        <DetailsUnwrapSwitch
          unwrapped={borrowUnWrapped}
          setUnWrapped={setBorrowUnWrapped}
          label={
            <Typography>{`Unwrap ${poolReserve.symbol} (to borrow ${currentNetworkConfig.baseAssetSymbol})`}</Typography>
          }
        />
      )}

      <TxModalDetails gasLimit={gasLimit}>
        <DetailsIncentivesLine
          incentives={incentive}
          symbol={poolReserve.symbol}
        />
        <DetailsHFLine
          visibleHfChange={!!amount}
          healthFactor={user.healthFactor}
          futureHealthFactor={newHealthFactor.toString(10)}
        />
      </TxModalDetails>

      {txError && <GasEstimationError txError={txError} />}

      {displayRiskCheckbox && (
        <BorrowAmountWarning
          riskCheckboxAccepted={riskCheckboxAccepted}
          onRiskCheckboxChange={() => {
            setRiskCheckboxAccepted(!riskCheckboxAccepted);
          }}
        />
      )}

      {/* <ParameterChangewarning underlyingAsset={underlyingAsset} /> */}

      <BorrowActions
        poolReserve={poolReserve}
        amountToBorrow={amount}
        poolAddress={
          borrowUnWrapped && poolReserve.isWrappedBaseAsset
            ? API_ETH_MOCK_ADDRESS
            : poolReserve.underlyingAsset
        }
        interestRateMode={interestRateMode}
        isWrongNetwork={isWrongNetwork}
        symbol={symbol}
        blocked={
          blockingError !== undefined ||
          (displayRiskCheckbox && !riskCheckboxAccepted)
        }
        sx={displayRiskCheckbox ? { mt: 0 } : {}}
      />
    </>
  );
};
