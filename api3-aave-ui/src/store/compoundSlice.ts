import { GhoService } from "contract-helpers";
import { GhoReserveData, GhoUserData, normalize } from "@aave/math-utils";
import { GHO_SUPPORTED_MARKETS } from "src/utils/ghoUtilities";
import { getProvider } from "src/utils/marketsAndNetworksConfig";
import { StateCreator } from "zustand";

import { RootStore } from "./root";
import cometABI from "../abis/comet.json";
import { Contract } from "ethers";
import { populateCompoundMarket } from "configuration";
import {
  compRewardApr,
  getAllAssets,
  getBaseAssetSupply,
  getBorrowAPR,
  getBorrowCapacity,
  getLiquidationRisk,
  getPrices,
  getSupplyAPR,
  getTokenInfo,
  getTotalReserves,
} from "src/helpers/compoundHelpers";
import { erc20ABI } from "wagmi";
import { formatUnits } from "viem";

interface GhoMarketConfig {
  ghoTokenAddress: string;
  uiGhoDataProviderAddress: string;
}

interface GhoUtilMintingAvailableParams {
  symbol: string;
  currentMarket: string;
}

export interface CompoundV3Slice {
  compoundV3Assets: any[];
  compoundV3Supplied: any[];
  compoundV3Borrowed: any[];
  assetInfo: any;
  ghoReserveDataFetched: boolean;
  ghoUserDataFetched: boolean;
  ghoUserQualifiesForDiscount: (futureBorrowAmount?: string) => boolean;
  ghoMarketConfig: () => GhoMarketConfig | undefined;
  refreshCompoundData: () => Promise<void>;
  displayGho: ({
    symbol,
    currentMarket,
  }: GhoUtilMintingAvailableParams) => boolean;
}

export const createCompoundSlice: StateCreator<
  RootStore,
  [["zustand/subscribeWithSelector", never], ["zustand/devtools", never]],
  [],
  CompoundV3Slice
> = (set, get) => {
  return {
    compoundV3Assets: [],
    compoundV3Supplied: [],
    compoundV3Borrowed: [],
    assetInfo: {},
    ghoReserveDataFetched: false,
    ghoUserDataFetched: false,
    displayGho: ({
      symbol,
      currentMarket,
    }: GhoUtilMintingAvailableParams): boolean => {
      return symbol === "GHO" && GHO_SUPPORTED_MARKETS.includes(currentMarket);
    },
    ghoUserQualifiesForDiscount: (futureBorrowAmount = "0") => {
      const ghoReserveDataFetched = get().ghoReserveDataFetched;
      const ghoUserDataFetched = get().ghoUserDataFetched;

      if (!ghoReserveDataFetched || !ghoUserDataFetched) return false;

      const ghoReserveData = get().ghoReserveData;
      const ghoUserData = get().ghoUserData;

      const borrowBalance = Number(
        normalize(ghoUserData.userGhoScaledBorrowBalance, 18),
      );
      const minBorrowBalanceForDiscount = Number(
        normalize(ghoReserveData.ghoMinDebtTokenBalanceForDiscount, 18),
      );

      const stkAaveBalance = Number(
        normalize(ghoUserData.userDiscountTokenBalance, 18),
      );
      const minStkAaveBalanceForDiscount = Number(
        normalize(ghoReserveData.ghoMinDiscountTokenBalanceForDiscount, 18),
      );

      return (
        borrowBalance + Number(futureBorrowAmount) >=
          minBorrowBalanceForDiscount &&
        stkAaveBalance >= minStkAaveBalanceForDiscount
      );
    },
    ghoMarketConfig: () => {
      const market = get().currentMarket;
      if (!GHO_SUPPORTED_MARKETS.includes(market)) {
        return undefined;
      }

      const {
        GHO_TOKEN_ADDRESS: ghoTokenAddress,
        GHO_UI_DATA_PROVIDER: uiGhoDataProviderAddress,
      } = get().currentMarketData.addresses;
      if (!ghoTokenAddress || !uiGhoDataProviderAddress) {
        return undefined;
      }

      return {
        ghoTokenAddress,
        uiGhoDataProviderAddress,
      };
    },
    refreshCompoundData: async () => {
      console.log("loading comet data");

      const compoundMarket = populateCompoundMarket();

      const provider = getProvider(get().currentMarketData.chainId);
      const comet = new Contract(compoundMarket.comet, cometABI, provider);

      const [assets, prices, supplyAPR, borrowAPR, baseSupplied] =
        await Promise.all([
          getAllAssets(comet),
          getPrices(comet),
          getSupplyAPR(comet),
          getBorrowAPR(comet),

          getBaseAssetSupply(comet, get().account),
        ]);

      const assetDetailPromises = assets
        .map((el) => el.asset)
        .map((address: any) => {
          return getTokenInfo(address, provider, get().account);
        });
      const assetDetails = await Promise.all(assetDetailPromises);

      const [usdcInfo, borrowInfo, totalReserves]: [any, any, string] =
        await Promise.all([
          getTokenInfo(compoundMarket.USDC || "", provider, get().account),
          getBorrowCapacity(get().account, assets.length, assets, provider),
          getTotalReserves(provider),
        ]);

      const formattedAssets = assets.map((rawAsset, index) => {
        return {
          asset: {
            ...assetDetails?.[index],
            price: prices?.[index],
            assetDetails: [index],
          },
          borrowCollateralFactor: rawAsset.borrowCollateralFactor.toString(),
          liquidateCollateralFactor:
            rawAsset.liquidateCollateralFactor.toString(),
          liquidationFactor: rawAsset.liquidationFactor.toString(),
          offset: rawAsset.offset.toString(),
          priceFeed: rawAsset.priceFeed.toString(),
          scale: rawAsset.scale.toString(),
          supplyCap: rawAsset.supplyCap.toString(),
          totalReserves,
        };
      });

      console.log("comet data ", { formattedAssets });
      // calculate liquidation risk
      const liquidationRisk = getLiquidationRisk(
        formattedAssets,
        borrowInfo?.borrowedInBase,
      );

      // calculate aprs

      set({
        compoundV3Assets: formattedAssets,
        assetInfo: {
          supplyAPR,
          borrowAPR,
          totalReserves,
          liquidationRisk,
          baseInfo: {
            ...usdcInfo,
            suppliedFormatted: formatUnits(
              baseSupplied,
              usdcInfo.decimals,
            ).toString(),
            supplied: baseSupplied,
            ...borrowInfo,
          },
        },
      });

      // const ghoConfig = get().ghoMarketConfig();
      // if (!ghoConfig) return;
      // const account = get().account;
      // const ghoService = new GhoService({
      //   provider: getProvider(get().currentMarketData.chainId),
      //   uiGhoDataProviderAddress: ghoConfig.uiGhoDataProviderAddress,
      // });
      // if (account) {
      //   try {
      //     const [ghoReserveData, ghoUserData] = await Promise.all([
      //       ghoService.getGhoReserveData(),
      //       ghoService.getGhoUserData(account),
      //     ]);
      //     set({
      //       ghoReserveData: ghoReserveData,
      //       ghoUserData: ghoUserData,
      //       ghoReserveDataFetched: true,
      //       ghoUserDataFetched: true,
      //     });
      //   } catch (err) {
      //     console.log("error", err);
      //   }
      // } else {
      //   try {
      //     const ghoReserveData = await ghoService.getGhoReserveData();
      //     set({
      //       ghoReserveData: ghoReserveData,
      //       ghoReserveDataFetched: true,
      //       ghoUserDataFetched: false,
      //     });
      //   } catch (err) {
      //     console.log("error", err);
      //   }
      // }
    },
  };
};
