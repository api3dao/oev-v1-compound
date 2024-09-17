import { API_ETH_MOCK_ADDRESS } from "contract-helpers";
import { USD_DECIMALS, valueToBigNumber } from "@aave/math-utils";
// import { Trans } from "@lingui/macro";
import { Box, Grid, Typography, useMediaQuery, useTheme } from "@mui/material";
import BigNumber from "bignumber.js";
import { Fragment, useState } from "react";
// import { ListColumn } from "src/components/lists/ListColumn";
// import { ListHeaderTitle } from "src/components/lists/ListHeaderTitle";
// import { ListHeaderWrapper } from "src/components/lists/ListHeaderWrapper";
// import { Warning } from "src/components/primitives/Warning";
// import { MarketWarning } from "src/components/transactions/Warnings/MarketWarning";
// import { AssetCapsProvider } from "src/hooks/useAssetCaps";
import { useRootStore } from "src/store/root";
import { fetchIconSymbolAndName } from "src/ui-config/reservePatches";

// import { ListWrapper } from "../../../../components/lists/ListWrapper";
// import { Link, ROUTES } from "../../../../components/primitives/Link";
// import {
//   ComputedReserveData,
//   useAppDataContext,
// } from "../../../../hooks/app-data-provider/useAppDataProvider";
// import { useWalletBalances } from "../../../../hooks/app-data-provider/useWalletBalances";
// import { useProtocolDataContext } from "../../../../hooks/useProtocolDataContext";
// import {
//   DASHBOARD_LIST_COLUMN_WIDTHS,
//   DashboardReserve,
//   handleSortDashboardReserves,
// } from "../../../../utils/dashboardSortUtils";
// import { DashboardListTopPanel } from "../../DashboardListTopPanel";
// import { ListButtonsColumn } from "../ListButtonsColumn";
// import { ListLoader } from "../ListLoader";
import { SupplyAssetsListItem } from "./SupplyAssetsListItem";
import { SupplyAssetsListMobileItem } from "./SupplyAssetsListMobileItem";
// import { WalletEmptyInfo } from "./WalletEmptyInfo";
import Pane from "components/pane";
import { useProtocolDataContext } from "src/hooks/useProtocolDataContext";
import {
  ComputedReserveData,
  useAppDataContext,
} from "src/hooks/app-data-provider/useAppDataProvider";
import { useWalletBalances } from "src/hooks/app-data-provider/useWalletBalances";
import {
  DashboardReserve,
  handleSortDashboardReserves,
} from "src/utils/dashboardSortUtils";

export const SupplyAssetsList = () => {
  const {
    currentNetworkConfig,
    currentChainId,
    currentMarketData,
    currentMarket,
  } = useProtocolDataContext();
  const {
    user,
    reserves,
    marketReferencePriceInUsd,
    loading: loadingReserves,
  } = useAppDataContext();
  const { walletBalances, loading } = useWalletBalances();
  const [displayGho] = useRootStore((store) => [store.displayGho]);
  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down("xsm"));

  const [sortName, setSortName] = useState("");
  const [sortDesc, setSortDesc] = useState(false);

  const {
    bridge,
    isTestnet,
    baseAssetSymbol,
    name: networkName,
  } = currentNetworkConfig;

  const localStorageName = "showSupplyZeroAssets";
  const [isShowZeroAssets, setIsShowZeroAssets] = useState(true);
  // window.localStorage.getItem(localStorageName) === "true"

  const tokensToSupply = reserves
    .filter(
      (reserve: ComputedReserveData) =>
        !(reserve.isFrozen || reserve.isPaused) &&
        !displayGho({ symbol: reserve.symbol, currentMarket }),
    )
    .map((reserve: ComputedReserveData) => {
      const walletBalance = walletBalances[reserve.underlyingAsset]?.amount;
      const walletBalanceUSD =
        walletBalances[reserve.underlyingAsset]?.amountUSD;
      let availableToDeposit = valueToBigNumber(walletBalance);
      if (reserve.supplyCap !== "0") {
        availableToDeposit = BigNumber.min(
          availableToDeposit,
          new BigNumber(reserve.supplyCap)
            .minus(reserve.totalLiquidity)
            .multipliedBy("0.995"),
        );
      }
      const availableToDepositUSD = valueToBigNumber(availableToDeposit)
        .multipliedBy(reserve.priceInMarketReferenceCurrency)
        .multipliedBy(marketReferencePriceInUsd)
        .shiftedBy(-USD_DECIMALS)
        .toString();

      const isIsolated = reserve.isIsolated;
      const hasDifferentCollateral = user?.userReservesData.find(
        (userRes) =>
          userRes.usageAsCollateralEnabledOnUser &&
          userRes.reserve.id !== reserve.id,
      );

      const usageAsCollateralEnabledOnUser = !user?.isInIsolationMode
        ? reserve.reserveLiquidationThreshold !== "0" &&
          (!isIsolated || (isIsolated && !hasDifferentCollateral))
        : !isIsolated
        ? false
        : !hasDifferentCollateral;

      if (reserve.isWrappedBaseAsset) {
        let baseAvailableToDeposit = valueToBigNumber(
          walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()]?.amount,
        );
        if (reserve.supplyCap !== "0") {
          baseAvailableToDeposit = BigNumber.min(
            baseAvailableToDeposit,
            new BigNumber(reserve.supplyCap)
              .minus(reserve.totalLiquidity)
              .multipliedBy("0.995"),
          );
        }
        const baseAvailableToDepositUSD = valueToBigNumber(
          baseAvailableToDeposit,
        )
          .multipliedBy(reserve.priceInMarketReferenceCurrency)
          .multipliedBy(marketReferencePriceInUsd)
          .shiftedBy(-USD_DECIMALS)
          .toString();
        return [
          {
            ...reserve,
            reserve,
            underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
            ...fetchIconSymbolAndName({
              symbol: baseAssetSymbol,
              underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
            }),
            walletBalance:
              walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()]?.amount,
            walletBalanceUSD:
              walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()]?.amountUSD,
            availableToDeposit: baseAvailableToDeposit.toString(),
            availableToDepositUSD: baseAvailableToDepositUSD,
            usageAsCollateralEnabledOnUser,
            detailsAddress: reserve.underlyingAsset,
            id: reserve.id + "base",
          },
          {
            ...reserve,
            reserve,
            walletBalance,
            walletBalanceUSD,
            availableToDeposit:
              availableToDeposit.toNumber() <= 0
                ? "0"
                : availableToDeposit.toString(),
            availableToDepositUSD:
              Number(availableToDepositUSD) <= 0
                ? "0"
                : availableToDepositUSD.toString(),
            usageAsCollateralEnabledOnUser,
            detailsAddress: reserve.underlyingAsset,
          },
        ];
      }

      return {
        ...reserve,
        reserve,
        walletBalance,
        walletBalanceUSD,
        availableToDeposit:
          availableToDeposit.toNumber() <= 0
            ? "0"
            : availableToDeposit.toString(),
        availableToDepositUSD:
          Number(availableToDepositUSD) <= 0
            ? "0"
            : availableToDepositUSD.toString(),
        usageAsCollateralEnabledOnUser,
        detailsAddress: reserve.underlyingAsset,
      };
    })
    .flat();

  const sortedSupplyReserves = tokensToSupply.sort((a, b) =>
    +a.walletBalanceUSD > +b.walletBalanceUSD ? -1 : 1,
  );
  const filteredSupplyReserves = sortedSupplyReserves.filter(
    (reserve) => reserve.availableToDepositUSD !== "0",
  );

  // Filter out reserves
  const supplyReserves: unknown = isShowZeroAssets
    ? sortedSupplyReserves
    : filteredSupplyReserves.length >= 1
    ? filteredSupplyReserves
    : sortedSupplyReserves;

  // Transform to the DashboardReserve schema so the sort utils can work with it
  const preSortedReserves = supplyReserves as DashboardReserve[];
  const sortedReserves = handleSortDashboardReserves(
    sortDesc,
    sortName,
    "assets",
    preSortedReserves,
  );

  const supplyDisabled = !tokensToSupply.length;

  return (
    <>
      <h2 className="firm-voice mb-5">Supply</h2>
      <ul className="dashboard-list-items">
        {sortedReserves.map((item: any) => (
          <Fragment key={item.underlyingAsset}>
            {downToXSM ? (
              <SupplyAssetsListItem {...item} key={item.id} />
            ) : (
              <SupplyAssetsListItem {...item} key={item.id} />
            )}
          </Fragment>
        ))}
      </ul>
    </>
  );
};
