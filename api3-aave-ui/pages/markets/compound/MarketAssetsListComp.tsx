import { FormattedNumber } from "src/components/primitives/FormattedNumber";
import React from "react";
import { ComputedReserveData } from "src/hooks/app-data-provider/useAppDataProvider";
import SymbolIcon from "src/components/SymbolIcon";
import { useProtocolDataContext } from "src/hooks/useProtocolDataContext";
import { formatUnits } from "viem";
import { useModalContext } from "src/hooks/useModal";
import { populateCompoundMarket } from "configuration";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";

type MarketAssetsListProps = {
  reserves: ComputedReserveData[];
  loading: boolean;
};

function MarketItem({ reserve }: any) {
  const { openSupply, openBorrow } = useModalContext();
  const { currentMarket, currentNetworkConfig } = useProtocolDataContext();
  const compoundMarket = populateCompoundMarket();
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const onSupplyClicked = () => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }

    openSupply(
      reserve?.asset?.address,
      currentMarket,
      reserve?.asset?.name,
      "reserve",
      true,
    );
  };

  const onBorrowClicked = () => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }

    openBorrow(
      reserve?.asset?.address,
      currentMarket,
      reserve?.asset?.name,
      "reserve",
      true,
    );
  };

  return (
    <li className="market-list-item " key={reserve?.asset?.symbol}>
      <div className="flex min-w-[200px] items-center gap-2">
        <SymbolIcon
          symbol={
            reserve?.asset?.symbol === "WETH" ? "ETH" : reserve?.asset?.symbol
          }
        />

        <div className="flex h-full flex-col">
          <p className="solid-voice">{reserve?.asset?.name}</p>
          <p className="whisper-voice">{reserve?.asset?.symbol}</p>
        </div>
      </div>
      <div className="min-w-max">
        <p>
          <FormattedNumber value={reserve?.asset?.price} symbol="USD" />
        </p>
      </div>
      <div className="min-w-max">
        <p>
          <FormattedNumber
            data-cy={`apy`}
            value={formatUnits(reserve.borrowCollateralFactor, 16)}
            variant={"main16"}
            symbolsVariant={"main16"}
          />
        </p>
      </div>
      <div className="min-w-max">
        <p>
          <FormattedNumber
            compact
            value={formatUnits(reserve.liquidateCollateralFactor, 16)}
            variant="main16"
          />
        </p>
      </div>
      <div className="min-w-max">
        <p>
          <FormattedNumber
            compact
            value={formatUnits(
              BigInt("1000000000000000000") - BigInt(reserve.liquidationFactor),
              16,
            )}
            variant="main16"
          />
        </p>
      </div>
      <div className="min-w-max">
        <p>
          <FormattedNumber
            // data-cy={`apy`}
            value={reserve?.asset?.supplied}
            variant={"main16"}
            symbolsVariant={"main16"}
          />
        </p>
      </div>
      <div className="min-w-max">
        <button
          onClick={onSupplyClicked}
          // disabled={disable}
          data-cy="supplybutton"
          className="button whisper-voice mr-2"
        >
          +
        </button>
        <button
          onClick={onBorrowClicked}
          // disabled={disable}
          data-cy="supplybutton"
          className="button whisper-voice"
        >
          -
        </button>
      </div>
    </li>
  );
}

export default function MarketAssetsListComp({
  reserves,
  loading,
}: MarketAssetsListProps) {
  return (
    <>
      {/* <h2 className="attention-voice text-center ">Market</h2> */}
      <ul className="grid gap-2 overflow-x-scroll  p-4">
        <li className="market-list-item   ">
          <div className="min-w-[200px]">
            <h3 className="teaser-voice font-700">Collateral Asset</h3>
          </div>
          <div className="min-w-max">
            {" "}
            <h3 className="teaser-voice font-700">
              Oracle Price /
              <strong className="whisper-voice text-primary"> $</strong>
            </h3>
          </div>
          <div className="min-w-max">
            <h3 className="teaser-voice font-700">
              Collateral Factor /
              <strong className="whisper-voice text-primary"> %</strong>
            </h3>
          </div>
          <div className="min-w-max">
            <h3 className="teaser-voice font-700">
              Liquidation Factor /
              <strong className="whisper-voice text-primary"> %</strong>
            </h3>
          </div>
          <div className="min-w-max">
            <h3 className="teaser-voice font-700">
              Liquidation Panality /
              <strong className="whisper-voice text-primary"> %</strong>
            </h3>
          </div>

          <div className="min-w-max">
            <h3 className="teaser-voice font-700">
              Collateral Supplied /
              <strong className="whisper-voice text-primary"> </strong>
            </h3>
          </div>

          <div className="min-w-max">
            <h3 className="teaser-voice font-700">
              Action
              <strong className="whisper-voice text-primary">{""} </strong>
            </h3>
          </div>
          <div className="min-w-max"></div>
        </li>
        {reserves?.map((reserve: any, index: number) => {
          return <MarketItem reserve={reserve} key={index} />;
        })}
      </ul>
    </>
  );
}
