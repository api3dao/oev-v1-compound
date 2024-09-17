import { useConnectModal } from "@rainbow-me/rainbowkit";
import { populateCompoundMarket } from "configuration";
import React, { useEffect, useMemo } from "react";
import { FormattedNumber } from "src/components/primitives/FormattedNumber";
import SymbolIcon from "src/components/SymbolIcon";
import { useAppDataContext } from "src/hooks/app-data-provider/useAppDataProvider";
import { useModalContext } from "src/hooks/useModal";
import { useProtocolDataContext } from "src/hooks/useProtocolDataContext";
import { useAccount, useConnect } from "wagmi";

export default function CompoundDashboard() {
  const { openSupply, openBorrow, openWithdraw } = useModalContext();

  const compoundMarket = populateCompoundMarket();
  const { currentMarket } = useProtocolDataContext();
  const { compoundState } = useAppDataContext();
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const onSupplyClicked = () => {
    const usdc = compoundMarket.marketAsset;

    if (!isConnected) {
      openConnectModal?.();
      return;
    }
    openSupply(usdc, currentMarket, "USDC", "reserve", true);
  };

  const onBorrowClicked = () => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }

    // withdraw usdc
    const usdc = compoundMarket.marketAsset;
    openBorrow(usdc, currentMarket, "USDC", "reserve", true);
  };

  const isBaseSupplied = useMemo(() => {
    if (!compoundState?.assetInfo?.baseInfo?.suppliedFormatted) {
      return false;
    }

    return compoundState?.assetInfo?.baseInfo?.suppliedFormatted > 0
      ? true
      : false;
  }, [compoundState]);

  const isBorrowCapacityAvailable = useMemo(() => {
    if (!compoundState?.assetInfo?.baseInfo?.borrowCapacityBase) {
      return false;
    }

    return compoundState?.assetInfo?.baseInfo?.borrowCapacityBase > 0
      ? true
      : false;
  }, [compoundState]);

  const isBaseBorrowed = useMemo(() => {
    if (!compoundState?.assetInfo?.baseInfo?.borrowedInBase) {
      return false;
    }

    return compoundState?.assetInfo?.baseInfo?.borrowedInBase > 0
      ? true
      : false;
  }, [compoundState]);

  return (
    <section>
      <div className="inner-column grid">
        <div className="flex items-center gap-2 justify-self-center">
          <SymbolIcon symbol={"USDC"} />

          <div className="flex flex-col">
            <h1 className="loud-voice">{"USDC Market"}</h1>
          </div>

          <div className="ml-5 min-w-max">
            <button
              onClick={onSupplyClicked}
              disabled={false}
              // disabled={disable}
              data-cy="supplybutton"
              className="button whisper-voice mr-2"
            >
              {isBaseBorrowed ? "Repay USDC" : "Supply USDC"}
            </button>
            <button
              onClick={onBorrowClicked}
              // disabled={disable}
              data-cy="supplybutton"
              className="button whisper-voice"
            >
              {isBaseSupplied ? "Withdraw USDC" : "Borrow USDC"}
            </button>
          </div>
        </div>
        <div className="summary-cards">
          <div className="summary-card">
            <h3 className="teaser-voice">Todal Reserves </h3>
            <p className="attention-voice">
              <FormattedNumber
                value={compoundState?.assetInfo?.totalReserves}
                // data-cy={`apy`}
                symbol="USD"
              />{" "}
            </p>
          </div>

          <div className="summary-card">
            <h3 className="teaser-voice">Net Supply APR </h3>
            <p className="attention-voice">
              <FormattedNumber
                value={compoundState?.assetInfo?.supplyAPR}
                // data-cy={`apy`}
                symbol="%"
              />{" "}
            </p>
          </div>
          <div className="summary-card">
            <h3 className="teaser-voice">Net Borrow APR </h3>
            <p className="attention-voice">
              <FormattedNumber
                value={compoundState?.assetInfo?.borrowAPR}
                // data-cy={`apy`}
                symbol="%"
              />{" "}
            </p>
          </div>

          <div className="summary-card">
            <h3 className="teaser-voice">Borrow Capacity</h3>
            <p className="attention-voice ">
              <FormattedNumber
                value={compoundState?.assetInfo?.baseInfo?.borrowCapacityBase}
                symbol="USDC"
                visibleDecimals={2}
              />
            </p>
          </div>
          <div className="summary-card">
            <h3 className="teaser-voice">
              {isBaseSupplied ? "USDC Supplied" : "USDC Borrowed"}
            </h3>
            <p className="attention-voice ">
              <FormattedNumber
                value={
                  isBaseSupplied
                    ? compoundState?.assetInfo?.baseInfo?.suppliedFormatted
                    : compoundState?.assetInfo?.baseInfo?.borrowedInBase
                }
                symbol="USDC"
                visibleDecimals={2}
              />
            </p>
          </div>
          <div className="summary-card">
            <h3 className="teaser-voice">Liquidation Risk </h3>
            <p className="attention-voice ">
              <FormattedNumber
                value={compoundState?.assetInfo?.liquidationRisk}
                visibleDecimals={2}
              />
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
