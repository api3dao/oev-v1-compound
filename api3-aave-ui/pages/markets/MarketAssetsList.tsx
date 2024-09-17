import { FormattedNumber } from "src/components/primitives/FormattedNumber";
import Link from "next/link";
import React from "react";
import { ComputedReserveData } from "src/hooks/app-data-provider/useAppDataProvider";
import { useProtocolDataContext } from "src/hooks/useProtocolDataContext";
import SymbolIcon from "src/components/SymbolIcon";

type MarketAssetsListProps = {
  reserves: ComputedReserveData[];
  loading: boolean;
};

export default function MarketAssetsList({
  reserves,
  loading,
}: MarketAssetsListProps) {
  const { currentMarket } = useProtocolDataContext();

  return (
    <>
      {/* <h2 className="attention-voice text-center ">Market</h2> */}
      <ul className="grid gap-2 overflow-x-scroll  p-4">
        <li className="market-list-item   ">
          <div className="min-w-[200px]">
            <h3 className="teaser-voice font-700">Asset</h3>
          </div>
          <div className="min-w-max">
            {" "}
            <h3 className="teaser-voice font-700">
              Total supplied /
              <strong className="whisper-voice text-primary"> $</strong>
            </h3>
          </div>
          <div className="min-w-max">
            <h3 className="teaser-voice font-700">
              Supply APY /
              <strong className="whisper-voice text-primary"> %</strong>
            </h3>
          </div>
          <div className="min-w-max">
            <h3 className="teaser-voice font-700">
              Total borrowed /
              <strong className="whisper-voice text-primary"> $</strong>
            </h3>
          </div>
          <div className="min-w-max">
            {" "}
            <h3 className="teaser-voice font-700">
              Borrow APY, variable /
              <strong className="whisper-voice text-primary"> ±%</strong>
            </h3>
          </div>
          <div className="min-w-max">
            <h3 className="teaser-voice font-700">
              Borrow APY, stable /
              <strong className="whisper-voice text-primary"> %</strong>
            </h3>
          </div>
          <div className="min-w-max"></div>
        </li>
        {reserves?.map((reserve: any) => {
          return (
            <li className="market-list-item " key={reserve?.symbol}>
              <div className="flex min-w-[200px] items-center gap-2">
                <SymbolIcon symbol={reserve?.symbol} />

                <div className="flex h-full flex-col">
                  <p className="solid-voice">{reserve?.name}</p>
                  <p className="whisper-voice">{reserve?.symbol}</p>
                </div>
              </div>
              <div className="min-w-max">
                <p>
                  <FormattedNumber
                    compact
                    value={reserve.totalLiquidity}
                    variant="main16"
                  />
                </p>
              </div>
              <div className="min-w-max">
                <p>
                  <FormattedNumber
                    data-cy={`apy`}
                    value={reserve.supplyAPY}
                    variant={"main16"}
                    symbolsVariant={"main16"}
                    // color={color}
                    // symbolsColor={color}
                  />
                </p>
              </div>
              <div className="min-w-max">
                <p>
                  <FormattedNumber
                    compact
                    value={reserve.totalDebt}
                    variant="main16"
                  />
                </p>
              </div>
              <div className="min-w-max">
                <p>
                  <FormattedNumber
                    data-cy={`apy`}
                    value={reserve.variableBorrowAPY}
                    variant={"main16"}
                    symbolsVariant={"main16"}
                  />
                </p>
              </div>
              <div className="min-w-max">
                <p>
                  <FormattedNumber
                    data-cy={`apy`}
                    value={reserve.stableBorrowAPY}
                    variant={"main16"}
                    symbolsVariant={"main16"}
                  />
                </p>
              </div>
              <div className="min-w-max">
                <Link
                  href={`asset-detail?underlyingAsset=${reserve?.id?.split(
                    "-",
                  )?.[1]}`}
                  // href={"/market/" + reserve?.name}
                  className="green pl-0 text"
                >
                  Details
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
