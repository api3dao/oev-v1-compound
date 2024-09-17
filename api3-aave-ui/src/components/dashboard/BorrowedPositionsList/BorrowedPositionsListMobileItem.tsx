import { InterestRate } from "contract-helpers";
import { Box, Button, Grid } from "@mui/material";
import { useAssetCaps } from "src/hooks/useAssetCaps";
import { useProtocolDataContext } from "src/hooks/useProtocolDataContext";
import { useRootStore } from "src/store/root";
import { DashboardReserve } from "src/utils/dashboardSortUtils";
import { isFeatureEnabled } from "src/utils/marketsAndNetworksConfig";
import { GENERAL } from "src/utils/mixPanelEvents";

import { IncentivesCard } from "../../incentives/IncentivesCard";
import { APYTypeTooltip } from "../../infoTooltips/APYTypeTooltip";
import { Row } from "../../primitives/Row";
import { useModalContext } from "../../../hooks/useModal";
import Image from "next/image";
import { FormattedNumber } from "src/components/primitives/FormattedNumber";

export const BorrowedPositionsListMobileItem = ({
  reserve,
  variableBorrows,
  variableBorrowsUSD,
  stableBorrows,
  stableBorrowsUSD,
  borrowRateMode,
  stableBorrowAPY,
}: DashboardReserve) => {
  const { currentMarket, currentMarketData } = useProtocolDataContext();
  const { openBorrow, openRepay, openRateSwitch, openDebtSwitch } =
    useModalContext();
  const { borrowCap } = useAssetCaps();

  const {
    symbol,
    iconSymbol,
    name,
    isActive,
    isFrozen,
    borrowingEnabled,
    stableBorrowRateEnabled,
    sIncentivesData,
    vIncentivesData,
    variableBorrowAPY,
    underlyingAsset,
  } = reserve;

  const totalBorrows = Number(
    borrowRateMode === InterestRate.Variable ? variableBorrows : stableBorrows,
  );

  const totalBorrowsUSD = Number(
    borrowRateMode === InterestRate.Variable
      ? variableBorrowsUSD
      : stableBorrowsUSD,
  );

  const apy = Number(
    borrowRateMode === InterestRate.Variable
      ? variableBorrowAPY
      : stableBorrowAPY,
  );

  const incentives =
    borrowRateMode === InterestRate.Variable
      ? vIncentivesData
      : sIncentivesData;

  const disableBorrow =
    !isActive || !borrowingEnabled || isFrozen || borrowCap?.isMaxed;

  const showSwitchButton = isFeatureEnabled.debtSwitch(currentMarketData);
  const disableSwitch = !isActive || reserve.symbol === "stETH";

  return (
    <div className="list-item">
      <Grid item md={2} sm={2} xs={2}>
        <div className="flex items-center gap-2">
          <picture className="w-[40px] max-w-[30px]">
            <Image
              src={`/logos/${reserve?.symbol}.png`}
              width={40}
              height={40}
              alt={reserve?.symbol}
            />
          </picture>
          <p className="whisper-voice">{reserve?.name}</p>
        </div>
      </Grid>

      <Grid item md={2} sm={2} xs={2}>
        <p>
          <FormattedNumber
            data-cy={`apy`}
            value={Number(
              borrowRateMode === InterestRate.Variable
                ? variableBorrows
                : stableBorrows,
            )}
          />
        </p>
      </Grid>

      <Grid item md={2} sm={2} xs={2}>
        <p>
          <FormattedNumber
            data-cy={`apy`}
            percent
            value={Number(
              borrowRateMode === InterestRate.Variable
                ? variableBorrowAPY
                : stableBorrowAPY,
            )}
          />
        </p>
      </Grid>

      <Grid item md={2} sm={2} xs={2}>
        <p className="whisper-voice"> {borrowRateMode}</p>
      </Grid>
      <Grid item md={2} sm={2} xs={2}>
        <div className="flex w-full sm:w-fit">
          <button
            // disabled={disableSupply}
            onClick={() => {
              openBorrow(
                reserve.underlyingAsset,
                currentMarket,
                name,
                "dashboard",
              );
            }}
            className="button whisper-voice"
          >
            Borrow
          </button>

          <button
            // disabled={disableSupply}
            onClick={() => {
              openRepay(
                reserve.underlyingAsset,
                borrowRateMode,
                isFrozen,
                currentMarket,
                name,
                "dashboard",
              );
            }}
            className="button whisper-voice"
          >
            Repay
          </button>
        </div>
      </Grid>
    </div>
  );
};
