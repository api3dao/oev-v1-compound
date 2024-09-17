import React from "react";
import { useAppDataContext } from "src/hooks/app-data-provider/useAppDataProvider";

import MarketAssetsList from "./MarketAssetsListComp";

export default function MarketAssetListContainerComp() {
  const { loading, compoundState } = useAppDataContext();

  const marketAssets: any = compoundState?.assets;

  return (
    <>
      <MarketAssetsList reserves={marketAssets} loading={loading} />
    </>
  );
}
