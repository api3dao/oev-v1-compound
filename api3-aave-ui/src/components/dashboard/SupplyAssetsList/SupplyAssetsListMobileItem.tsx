import { Box, Button } from "@mui/material";
// import { useAssetCaps } from 'src/hooks/useAssetCaps';
import { useProtocolDataContext } from "src/hooks/useProtocolDataContext";
import { DashboardReserve } from "src/utils/dashboardSortUtils";

import Row from "components/row";

export const SupplyAssetsListMobileItem = ({
  symbol,
  iconSymbol,
  name,
  walletBalance,
  walletBalanceUSD,
  supplyCap,
  totalLiquidity,
  supplyAPY,
  aIncentivesData,
  isIsolated,
  usageAsCollateralEnabledOnUser,
  isActive,
  isFreezed,
  underlyingAsset,
  detailsAddress,
}: DashboardReserve) => {
  const { currentMarket } = useProtocolDataContext();

  // Disable the asset to prevent it from being supplied if supply cap has been reached
  // const { supplyCap: supplyCapUsage } = useAssetCaps();
  // const isMaxCapReached = supplyCapUsage.isMaxed;

  // const disableSupply =
  //   !isActive || isFreezed || Number(walletBalance) <= 0 || isMaxCapReached;

  return (
    <Row
      key={name}
      ticker={symbol}
      name={name}
      subtitle={
        <>
          <p className="text-xs">Wallet:</p>
          <p className="text-xs">Borrowed:</p>
        </>
      }
    >
      <div className="flex gap-2 w-full sm:w-fit">
        <button className="whisper-voice button">Borrow</button>
        <button className="whisper-voice button">Pay Off</button>
      </div>
    </Row>
  );
};
