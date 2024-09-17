import { API_ETH_MOCK_ADDRESS } from "contract-helpers";
import { Typography, useMediaQuery, useTheme } from "@mui/material";
import { Fragment, useState } from "react";

import { useProtocolDataContext } from "src/hooks/useProtocolDataContext";
import { fetchIconSymbolAndName } from "src/ui-config/reservePatches";
import { GENERAL } from "src/utils/mixPanelEvents";

import { useAppDataContext } from "../../../hooks/app-data-provider/useAppDataProvider";
import {
  DASHBOARD_LIST_COLUMN_WIDTHS,
  DashboardReserve,
  handleSortDashboardReserves,
} from "../../../utils/dashboardSortUtils";

import { SuppliedPositionsListItem } from "./SuppliedPositionsListItem";
import { SuppliedPositionsListMobileItem } from "./SuppliedPositionsListMobileItem";
import Pane from "components/pane";
import { SupplyAssetsListItem } from "../SupplyAssetsList/SupplyAssetsListItem";
import { CollateralSwitchTooltip } from "src/components/infoTooltips/CollateralSwitchTooltip";
import { FormattedNumber } from "src/components/primitives/FormattedNumber";

export const SuppliedPositionsList = () => {
  const { user, loading } = useAppDataContext();
  const { currentNetworkConfig } = useProtocolDataContext();
  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down("xsm"));
  const [sortName, setSortName] = useState("");
  const [sortDesc, setSortDesc] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false);

  const suppliedPositions =
    user?.userReservesData
      .filter((userReserve) => userReserve.underlyingBalance !== "0")
      .map((userReserve) => ({
        ...userReserve,
        supplyAPY: userReserve.reserve.supplyAPY, // Note: added only for table sort
        reserve: {
          ...userReserve.reserve,
          ...(userReserve.reserve.isWrappedBaseAsset
            ? fetchIconSymbolAndName({
                symbol: currentNetworkConfig.baseAssetSymbol,
                underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
              })
            : {}),
        },
      })) || [];

  // Transform to the DashboardReserve schema so the sort utils can work with it
  const preSortedReserves = suppliedPositions as DashboardReserve[];
  const sortedReserves = handleSortDashboardReserves(
    sortDesc,
    sortName,
    "position",
    preSortedReserves,
  );

  return (
    <>
      <div className="mb-5 grid gap-6">
        <h2 className="attention-voice">Your Supplies</h2>

        <div className="flex flex-wrap gap-12 p-2">
          <div className="gap-2 ">
            <h3 className="teaser-voice ">
              Balance /
              <strong className="whisper-voice text-primary"> $</strong>
            </h3>
            <p className="firm-voice  text-primary">
              <FormattedNumber
                value={user?.totalLiquidityUSD || 0}
                visibleDecimals={2}
                symbolsColor="#A5A8B6"
                // symbolsVariant={noDataTypographyVariant}
              />
            </p>
          </div>
          <div className="gap-2 ">
            <h3 className="teaser-voice ">
              APY /<strong className="whisper-voice text-primary"> %</strong>
            </h3>
            <p className="firm-voice  text-primary">
              <FormattedNumber
                value={user?.earnedAPY || 0}
                visibleDecimals={2}
                symbolsColor="#A5A8B6"
              />
            </p>
          </div>
          <div className="gap-2 ">
            <h3 className="teaser-voice ">
              Collateral /
              <strong className="whisper-voice text-primary"> $</strong>
            </h3>
            <p className="firm-voice  text-primary">
              <FormattedNumber
                value={user?.totalCollateralUSD || 0}
                visibleDecimals={2}
                symbolsColor="#A5A8B6"
                // symbolsVariant={noDataTypographyVariant}
              />
            </p>
          </div>
        </div>
      </div>

      <ul className="dashboard-list-items">
        {/* <li className="dashboard-list-item">
          <h3 className="teaser-voice">Asset</h3>
          <h3 className="teaser-voice">Balance</h3>
          <h3 className="teaser-voice">APY</h3>
          <h3 className="teaser-voice">
            {" "}
            <CollateralSwitchTooltip
              event={{
                eventName: GENERAL.TOOL_TIP,
                eventParams: { tooltip: "Collateral Switch" },
              }}
              text={<div>Collateral</div>}
              key="Collateral"
              variant="subheader2"
            />
          </h3>
        </li> */}
        {sortedReserves.map((item: any) => (
          <Fragment key={item.underlyingAsset}>
            <SuppliedPositionsListItem {...item} key={item.id} />
          </Fragment>
        ))}
      </ul>
    </>
  );
};
