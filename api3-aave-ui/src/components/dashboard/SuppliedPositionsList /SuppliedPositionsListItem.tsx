import { Switch } from "@mui/material";
import { useAppDataContext } from "src/hooks/app-data-provider/useAppDataProvider";
import { useAssetCaps } from "src/hooks/useAssetCaps";
import { useModalContext } from "src/hooks/useModal";
import { DashboardReserve } from "src/utils/dashboardSortUtils";

import { useProtocolDataContext } from "../../../hooks/useProtocolDataContext";
import { isFeatureEnabled } from "../../../utils/marketsAndNetworksConfig";
import { FormattedNumber } from "src/components/primitives/FormattedNumber";

import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import SymbolIcon from "src/components/SymbolIcon";

export const SuppliedPositionsListItem = ({
  reserve,
  underlyingBalance,
  underlyingBalanceUSD,
  usageAsCollateralEnabledOnUser,
  underlyingAsset,
}: DashboardReserve) => {
  const { user } = useAppDataContext();
  const { isIsolated, aIncentivesData, isFrozen, isActive } = reserve;
  const { currentMarketData, currentMarket } = useProtocolDataContext();
  const { openSupply, openWithdraw, openCollateralChange, openSwap } =
    useModalContext();
  const { debtCeiling } = useAssetCaps();
  const isSwapButton = isFeatureEnabled.liquiditySwap(currentMarketData);

  const canBeEnabledAsCollateral =
    !debtCeiling?.isMaxed &&
    reserve.reserveLiquidationThreshold !== "0" &&
    ((!reserve.isIsolated && !user.isInIsolationMode) ||
      user.isolatedReserve?.underlyingAsset === reserve.underlyingAsset ||
      (reserve.isIsolated &&
        user.totalCollateralMarketReferenceCurrency === "0"));

  const disableSwap = !isActive || reserve.symbol == "stETH";
  const disableWithdraw = !isActive;
  const disableSupply = !isActive || isFrozen;

  const isEnabled = usageAsCollateralEnabledOnUser && canBeEnabledAsCollateral;

  const { openConnectModal } = useConnectModal();
  const { isConnected } = useAccount();

  return (
    <li className="dashboard-list-item">
      <div className="col-span-all flex items-center gap-2">
        <SymbolIcon symbol={reserve?.symbol} />
        <p className="firm-voice">{reserve?.name}</p>
      </div>

      <div>
        <h3 className="teaser-voice">Balance</h3>
        <p className="firm-voice ">
          <FormattedNumber data-cy={`apy`} value={underlyingBalance} />
        </p>
      </div>

      <div>
        <h3 className="teaser-voice">
          APY/<strong className="whisper-voice text-primary"> %</strong>
        </h3>

        <p className="firm-voice ">
          <FormattedNumber
            data-cy={`apy`}
            value={reserve?.supplyAPY}
            visibleDecimals={3}
          />
        </p>
      </div>

      <div className="actions items-center ">
        <div>
          <p className="teaser-voice">Collateral</p>
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
        </div>
        <button
          // disabled={disableSupply}
          onClick={() => {
            if (!isConnected) {
              openConnectModal?.();
            } else {
              openSupply(
                underlyingAsset,
                currentMarket,
                reserve?.name,
                "dashboard",
              );
              console.log("opening ");
            }
          }}
          className="button whisper-voice"
        >
          Supply
        </button>

        <button
          // disabled={disableSupply}
          onClick={() => {
            openWithdraw(
              underlyingAsset,
              currentMarket,
              reserve.name,
              "dashboard",
            );
          }}
          className="button whisper-voice outline"
        >
          Withdraw
        </button>
      </div>
    </li>
  );
};
