import { InterestRate } from "contract-helpers";
import { useAssetCaps } from "src/hooks/useAssetCaps";
import { useModalContext } from "src/hooks/useModal";
import { useProtocolDataContext } from "src/hooks/useProtocolDataContext";
import { DashboardReserve } from "src/utils/dashboardSortUtils";
import { isFeatureEnabled } from "src/utils/marketsAndNetworksConfig";
import Image from "next/image";
import { FormattedNumber } from "src/components/primitives/FormattedNumber";
import { populateAssetIcon } from "configuration";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import SymbolIcon from "src/components/SymbolIcon";

export const BorrowedPositionsListItem = ({
  reserve,
  variableBorrows,
  variableBorrowsUSD,
  stableBorrows,
  stableBorrowsUSD,
  borrowRateMode,
  stableBorrowAPY,
}: DashboardReserve) => {
  const { openBorrow, openRepay, openRateSwitch, openDebtSwitch } =
    useModalContext();
  const { currentMarket, currentMarketData } = useProtocolDataContext();
  const { borrowCap } = useAssetCaps();

  const {
    isActive,
    isFrozen,
    borrowingEnabled,
    stableBorrowRateEnabled,
    sIncentivesData,
    vIncentivesData,
    variableBorrowAPY,
    name,
  } = reserve;

  const disableBorrow =
    !isActive || !borrowingEnabled || isFrozen || borrowCap?.isMaxed;

  const showSwitchButton = isFeatureEnabled.debtSwitch(currentMarketData);
  const disableSwitch = !isActive || reserve.symbol == "stETH";

  const { openConnectModal } = useConnectModal();
  const { isConnected } = useAccount();

  return (
    <li className="dashboard-list-item">
      <div className="col-span-all flex items-center gap-2">
        <SymbolIcon symbol={reserve?.symbol} />
        <p className="firm-voice">{reserve?.name}</p>
      </div>

      <div>
        <h3 className="teaser-voice">debt</h3>
        <p className="firm-voice ">
          <FormattedNumber
            data-cy={`apy`}
            value={Number(
              borrowRateMode === InterestRate.Variable
                ? variableBorrows
                : stableBorrows,
            )}
          />
        </p>
      </div>

      <div>
        <h3 className="teaser-voice">
          apy, {borrowRateMode} /
          <strong className="whisper-voice text-primary"> ±%</strong>
        </h3>
        <p className="firm-voice ">
          <FormattedNumber
            data-cy={`apy`}
            visibleDecimals={2}
            value={Number(
              borrowRateMode === InterestRate.Variable
                ? variableBorrowAPY
                : stableBorrowAPY,
            )}
          />
        </p>
      </div>

      <div className="actions items-center">
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
            if (!isConnected) {
              openConnectModal?.();
            } else {
              openRepay(
                reserve.underlyingAsset,
                borrowRateMode,
                isFrozen,
                currentMarket,
                name,
                "dashboard",
              );
            }
          }}
          className="button whisper-voice outline"
        >
          Repay
        </button>
      </div>
    </li>
  );
};
