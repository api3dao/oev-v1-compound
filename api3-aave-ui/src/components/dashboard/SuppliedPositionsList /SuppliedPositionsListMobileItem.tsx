import { Box, Button, Grid, Switch } from "@mui/material";
import { useAppDataContext } from "src/hooks/app-data-provider/useAppDataProvider";
import { useAssetCaps } from "src/hooks/useAssetCaps";
import { DashboardReserve } from "src/utils/dashboardSortUtils";

import { useModalContext } from "../../../hooks/useModal";
import { useProtocolDataContext } from "../../../hooks/useProtocolDataContext";
import { isFeatureEnabled } from "../../../utils/marketsAndNetworksConfig";
import Image from "next/image";
import { FormattedNumber } from "src/components/primitives/FormattedNumber";
import { CheckBoxOutlined } from "@mui/icons-material";

export const SuppliedPositionsListMobileItem = ({
  reserve,
  underlyingBalance,
  underlyingBalanceUSD,
  usageAsCollateralEnabledOnUser,
  underlyingAsset,
}: DashboardReserve) => {
  const { user } = useAppDataContext();
  const { currentMarketData, currentMarket } = useProtocolDataContext();
  const { openSupply, openSwap, openWithdraw, openCollateralChange } =
    useModalContext();
  const { debtCeiling } = useAssetCaps();
  const isSwapButton = isFeatureEnabled.liquiditySwap(currentMarketData);
  const {
    symbol,
    iconSymbol,
    name,
    supplyAPY,
    isIsolated,
    aIncentivesData,
    isFrozen,
    isActive,
  } = reserve;

  const canBeEnabledAsCollateral =
    !debtCeiling.isMaxed &&
    reserve.reserveLiquidationThreshold !== "0" &&
    ((!reserve.isIsolated && !user.isInIsolationMode) ||
      user.isolatedReserve?.underlyingAsset === reserve.underlyingAsset ||
      (reserve.isIsolated &&
        user.totalCollateralMarketReferenceCurrency === "0"));

  const disableSwap = !isActive || reserve.symbol == "stETH";
  const disableWithdraw = !isActive;
  const disableSupply = !isActive || isFrozen;

  const isEnabled = usageAsCollateralEnabledOnUser && canBeEnabledAsCollateral;

  return (
    <div className="list-item">
      <Grid item md={2} sm={2} xs={2}>
        <div className="flex items-center gap-2">
          <picture className="w-[40px] max-w-[30px]">
            <Image
              src={`/logos/${reserve?.symbol}.png`}
              width={30}
              height={30}
              alt={reserve?.symbol}
            />
          </picture>
          <p className="whisper-voice">{reserve?.name}</p>
        </div>
      </Grid>

      <Grid item md={2} sm={2} xs={2}>
        <p>
          <FormattedNumber data-cy={`apy`} value={underlyingBalance} />
        </p>
      </Grid>

      <Grid item md={2} sm={2} xs={2}>
        <p>
          <FormattedNumber data-cy={`apy`} value={reserve?.supplyAPY} percent />
        </p>
      </Grid>

      <Grid item md={2} sm={2} xs={2}>
        <p>
          <Switch
            onClick={() => {
              openCollateralChange(
                underlyingAsset,
                currentMarket,
                reserve.name,
                "dashboard",
                usageAsCollateralEnabledOnUser,
              );
            }}
            disableRipple
            checked={isEnabled}
            disabled={!canBeEnabledAsCollateral}
          />
        </p>
      </Grid>
      <Grid item md={2} sm={2} xs={2}>
        <div className="flex w-full sm:w-fit">
          <button
            // disabled={disableSupply}
            onClick={() => {
              openSupply(
                underlyingAsset,
                currentMarket,
                reserve?.name,
                "dashboard",
              );
              console.log("opening ");
            }}
            className="button whisper-voice"
          >
            Supply
          </button>

          <button
            // disabled={disableSupply}
            onClick={() => {
              openSupply(
                underlyingAsset,
                currentMarket,
                reserve?.name,
                "dashboard",
              );
              console.log("opening ");
            }}
            className="button whisper-voice"
          >
            Withdraw
          </button>
        </div>
      </Grid>
    </div>
  );
};
