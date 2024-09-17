import React from "react";
import { useAppDataContext } from "src/hooks/app-data-provider/useAppDataProvider";
import { useProtocolDataContext } from "src/hooks/useProtocolDataContext";
import { getGhoReserve } from "src/utils/ghoUtilities";
import { fetchIconSymbolAndName } from "src/ui-config/reservePatches";
import { API_ETH_MOCK_ADDRESS } from "contract-helpers";
import MarketAssetsList from "./MarketAssetsList";

export default function MarketAssetListContainer() {
  const { reserves, loading } = useAppDataContext();
  const {
    currentMarket,
    currentMarketData,
    currentNetworkConfig,
    currentChainId,
  } = useProtocolDataContext();

  const ghoReserve = getGhoReserve(reserves);
  const filteredData = reserves
    // Filter out any non-active reserves
    .filter((res) => res.isActive)
    // Filter out all GHO, as we deliberately display it on supported markets
    .filter((res) => res !== ghoReserve)

    .map((reserve) => ({
      ...reserve,
      ...(reserve.isWrappedBaseAsset
        ? fetchIconSymbolAndName({
            symbol: currentNetworkConfig.baseAssetSymbol,
            underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
          })
        : {}),
    }));
  const marketFrozen = !reserves.some((reserve) => !reserve.isFrozen);
  const showFrozenMarketWarning =
    marketFrozen &&
    ["Harmony", "Fantom", "Ethereum AMM"].includes(
      currentMarketData?.marketTitle,
    );
  const unfrozenReserves = filteredData.filter(
    (r) => !r.isFrozen && !r.isPaused,
  );
  const frozenOrPausedReserves = filteredData.filter(
    (r) => r.isFrozen || r.isPaused,
  );

  return (
    <>
      <MarketAssetsList reserves={unfrozenReserves} loading={loading} />
    </>
  );
}
