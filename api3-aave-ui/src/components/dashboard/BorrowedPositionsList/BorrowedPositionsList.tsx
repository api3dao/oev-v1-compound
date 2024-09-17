import { API_ETH_MOCK_ADDRESS, InterestRate } from "contract-helpers";
import { valueToBigNumber } from "@aave/math-utils";
import { Typography, useMediaQuery, useTheme } from "@mui/material";
import { Fragment, useState } from "react";

import { AssetCapsProvider } from "src/hooks/useAssetCaps";
import { useProtocolDataContext } from "src/hooks/useProtocolDataContext";
import { useRootStore } from "src/store/root";
import { fetchIconSymbolAndName } from "src/ui-config/reservePatches";
import { GHO_SYMBOL } from "src/utils/ghoUtilities";
import { GENERAL } from "src/utils/mixPanelEvents";

import {
  ComputedUserReserveData,
  useAppDataContext,
} from "../../../hooks/app-data-provider/useAppDataProvider";
import {
  DASHBOARD_LIST_COLUMN_WIDTHS,
  DashboardReserve,
  handleSortDashboardReserves,
} from "../../../utils/dashboardSortUtils";

import { BorrowedPositionsListItem } from "./BorrowedPositionsListItem";
import { BorrowedPositionsListMobileItem } from "./BorrowedPositionsListMobileItem";
import { GhoBorrowedPositionsListItem } from "./GhoBorrowedPositionsListItem";
import Pane from "components/pane";
import { FormattedNumber } from "src/components/primitives/FormattedNumber";
import { APYTypeTooltip } from "src/components/infoTooltips/APYTypeTooltip";

export const BorrowedPositionsList = () => {
  const { user, loading, eModes } = useAppDataContext();
  const { currentMarketData, currentNetworkConfig, currentMarket } =
    useProtocolDataContext();
  const [displayGho] = useRootStore((store) => [store.displayGho]);
  const [sortName, setSortName] = useState("");
  const [sortDesc, setSortDesc] = useState(false);
  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down("xsm"));
  const showEModeButton =
    currentMarketData.v3 && Object.keys(eModes).length > 1;
  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false);

  let borrowPositions =
    user?.userReservesData.reduce(
      (acc, userReserve) => {
        if (userReserve.variableBorrows !== "0") {
          acc.push({
            ...userReserve,
            borrowRateMode: InterestRate.Variable,
            reserve: {
              ...userReserve.reserve,
              ...(userReserve.reserve.isWrappedBaseAsset
                ? fetchIconSymbolAndName({
                    symbol: currentNetworkConfig.baseAssetSymbol,
                    underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
                  })
                : {}),
            },
          });
        }
        if (userReserve.stableBorrows !== "0") {
          acc.push({
            ...userReserve,
            borrowRateMode: InterestRate.Stable,
            reserve: {
              ...userReserve.reserve,
              ...(userReserve.reserve.isWrappedBaseAsset
                ? fetchIconSymbolAndName({
                    symbol: currentNetworkConfig.baseAssetSymbol,
                    underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
                  })
                : {}),
            },
          });
        }
        return acc;
      },
      [] as (ComputedUserReserveData & { borrowRateMode: InterestRate })[],
    ) || [];

  // Move GHO to top of borrowed positions list
  const ghoReserve = borrowPositions.filter(
    (pos) => pos.reserve.symbol === GHO_SYMBOL,
  );
  if (ghoReserve.length > 0) {
    borrowPositions = borrowPositions.filter(
      (pos) => pos.reserve.symbol !== GHO_SYMBOL,
    );
    borrowPositions.unshift(ghoReserve[0]);
  }

  const maxBorrowAmount = valueToBigNumber(
    user?.totalBorrowsMarketReferenceCurrency || "0",
  ).plus(user?.availableBorrowsMarketReferenceCurrency || "0");
  const collateralUsagePercent = maxBorrowAmount.eq(0)
    ? "0"
    : valueToBigNumber(user?.totalBorrowsMarketReferenceCurrency || "0")
        .div(maxBorrowAmount)
        .toFixed();

  // Transform to the DashboardReserve schema so the sort utils can work with it
  const preSortedReserves = borrowPositions as DashboardReserve[];
  const sortedReserves = handleSortDashboardReserves(
    sortDesc,
    sortName,
    "position",
    preSortedReserves,
    true,
  );

  return (
    <>
      <div className="mb-5 grid gap-6">
        <h2 className="attention-voice ">Your Borrows</h2>
        <div className="flex flex-wrap gap-12 p-2">
          <div className="">
            <h3 className="teaser-voice ">
              Balance /
              <strong className="whisper-voice text-primary"> $</strong>
            </h3>
            <p className="firm-voice  ">
              <FormattedNumber
                value={user?.totalBorrowsUSD || 0}
                visibleDecimals={2}
                symbolsColor="#ffffff"
                // symbolsVariant={noDataTypographyVariant}
              />
            </p>
          </div>
          <div className="">
            <h3 className="teaser-voice ">
              APY /<strong className="whisper-voice text-primary"> %</strong>
            </h3>
            <p className="firm-voice  ">
              <FormattedNumber
                value={user?.debtAPY || 0}
                visibleDecimals={2}
                symbolsColor="#A5A8B6"
              />
            </p>
          </div>
          <div className="">
            <h3 className="teaser-voice ">
              Borrow power used /
              <strong className="whisper-voice text-primary"> %</strong>
            </h3>
            <p className="firm-voice  ">
              <FormattedNumber
                value={collateralUsagePercent || 0}
                visibleDecimals={2}
                symbolsColor="#A5A8B6"
                // symbolsVariant={noDataTypographyVariant}
              />
            </p>
          </div>
        </div>
      </div>

      <ul className="dashboard-list-items">
        {/* <li className=" dashboard-list-item">
          <h3 className="teaser-voice">Asset</h3>
          <h3 className="teaser-voice">Debt</h3>
          <h3 className="teaser-voice">APY</h3>
          <h3 className="teaser-voice">
            {" "}
            <APYTypeTooltip
              event={{
                eventName: GENERAL.TOOL_TIP,
                eventParams: { tooltip: "APY Type Borrow" },
              }}
              text={<div>APY type</div>}
              key="APY type"
              variant="subheader2"
            />
          </h3>
        </li> */}
        {sortedReserves.map((item: any) => (
          <Fragment key={item.underlyingAsset}>
            <BorrowedPositionsListItem {...item} key={item.id} />
          </Fragment>
        ))}
      </ul>
    </>
  );
};
