import { API_ETH_MOCK_ADDRESS, InterestRate } from "contract-helpers";
import { USD_DECIMALS, valueToBigNumber } from "@aave/math-utils";
import { useMediaQuery, useTheme } from "@mui/material";
import { Fragment, useState } from "react";

import { useRootStore } from "src/store/root";
import { fetchIconSymbolAndName } from "src/ui-config/reservePatches";
import { findAndFilterGhoReserve } from "src/utils/ghoUtilities";

import { BorrowAssetsListItem } from "./BorrowAssetsListItem";
import { useProtocolDataContext } from "src/hooks/useProtocolDataContext";
import {
  ComputedReserveData,
  useAppDataContext,
} from "src/hooks/app-data-provider/useAppDataProvider";
import Pane from "components/pane";
import {
  assetCanBeBorrowedByUser,
  getMaxAmountAvailableToBorrow,
} from "src/utils/getMaxAmountAvailableToBorrow";
import {
  DashboardReserve,
  handleSortDashboardReserves,
} from "src/utils/dashboardSortUtils";
// import { BorrowAssetsListMobileItem } from './BorrowAssetsListMobileItem';
// import { GhoBorrowAssetsListItem } from './GhoBorrowAssetsListItem';

export const BorrowAssetsList = () => {
  const { currentNetworkConfig, currentMarketData, currentMarket } =
    useProtocolDataContext();
  const { user, reserves, marketReferencePriceInUsd, loading } =
    useAppDataContext();
  const [displayGho] = useRootStore((store) => [store.displayGho]);
  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down("xsm"));
  const [sortName, setSortName] = useState("");
  const [sortDesc, setSortDesc] = useState(false);

  const { baseAssetSymbol } = currentNetworkConfig;

  const tokensToBorrow = reserves
    .filter((reserve) => assetCanBeBorrowedByUser(reserve, user))
    .map((reserve: ComputedReserveData) => {
      const availableBorrows = user
        ? Number(
            getMaxAmountAvailableToBorrow(reserve, user, InterestRate.Variable),
          )
        : 0;

      const availableBorrowsInUSD = valueToBigNumber(availableBorrows)
        .multipliedBy(reserve.formattedPriceInMarketReferenceCurrency)
        .multipliedBy(marketReferencePriceInUsd)
        .shiftedBy(-USD_DECIMALS)
        .toFixed(2);

      return {
        ...reserve,
        reserve,
        totalBorrows: reserve.totalDebt,
        availableBorrows,
        availableBorrowsInUSD,
        stableBorrowRate:
          reserve.stableBorrowRateEnabled && reserve.borrowingEnabled
            ? Number(reserve.stableBorrowAPY)
            : -1,
        variableBorrowRate: reserve.borrowingEnabled
          ? Number(reserve.variableBorrowAPY)
          : -1,
        iconSymbol: reserve.iconSymbol,
        ...(reserve.isWrappedBaseAsset
          ? fetchIconSymbolAndName({
              symbol: baseAssetSymbol,
              underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
            })
          : {}),
      };
    });

  const maxBorrowAmount = valueToBigNumber(
    user?.totalBorrowsMarketReferenceCurrency || "0",
  ).plus(user?.availableBorrowsMarketReferenceCurrency || "0");
  const collateralUsagePercent = maxBorrowAmount.eq(0)
    ? "0"
    : valueToBigNumber(user?.totalBorrowsMarketReferenceCurrency || "0")
        .div(maxBorrowAmount)
        .toFixed();

  const borrowReserves =
    user?.totalCollateralMarketReferenceCurrency === "0" ||
    +collateralUsagePercent >= 0.98
      ? tokensToBorrow
      : tokensToBorrow.filter(
          ({ availableBorrowsInUSD, totalLiquidityUSD, symbol }) =>
            (availableBorrowsInUSD !== "0.00" && totalLiquidityUSD !== "0") ||
            displayGho({
              symbol,
              currentMarket,
            }),
        );

  const { value: ghoReserve, filtered: filteredReserves } =
    findAndFilterGhoReserve(borrowReserves);
  const sortedReserves = handleSortDashboardReserves(
    sortDesc,
    sortName,
    "asset",
    filteredReserves as unknown as DashboardReserve[],
  );
  const borrowDisabled = !sortedReserves.length && !ghoReserve;

  // if (loading) return <CircularProgress />;

  return (
    <>
      <h2 className="firm-voice mb-5 ">Borrow</h2>

      <ul className="dashboard-list-items">
        {sortedReserves?.map((item: any) => (
          <Fragment key={item.underlyingAsset}>
            {downToXSM ? (
              <BorrowAssetsListItem {...item} />
            ) : (
              <BorrowAssetsListItem {...item} />
            )}
          </Fragment>
        ))}
      </ul>
    </>
  );
};
