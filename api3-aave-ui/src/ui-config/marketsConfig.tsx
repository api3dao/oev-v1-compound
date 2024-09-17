import { ChainId } from "contract-helpers";

import { ReactNode } from "react";
import {
  AaveV2Mumbai,
  AaveV2Sepolia,
  GiestV2Mumbai,
  GiestV2ScrollSepolia,
  GiestV2zkEvm,
} from "./localMarketConfigs";
import { populateChainConfigs, populateMarket } from "configuration";

export type MarketDataType = {
  v3?: boolean;
  marketTitle: string;
  // the network the market operates on
  chainId: ChainId;
  enabledFeatures?: {
    liquiditySwap?: boolean;
    staking?: boolean;
    governance?: boolean;
    faucet?: boolean;
    collateralRepay?: boolean;
    incentives?: boolean;
    permissions?: boolean;
    debtSwitch?: boolean;
  };
  isFork?: boolean;
  permissionComponent?: ReactNode;
  disableCharts?: boolean;
  subgraphUrl?: string;
  addresses: {
    LENDING_POOL_ADDRESS_PROVIDER: string;
    LENDING_POOL: string;
    WETH_GATEWAY?: string;
    SWAP_COLLATERAL_ADAPTER?: string;
    REPAY_WITH_COLLATERAL_ADAPTER?: string;
    DEBT_SWITCH_ADAPTER?: string;
    FAUCET?: string;
    PERMISSION_MANAGER?: string;
    WALLET_BALANCE_PROVIDER: string;
    L2_ENCODER?: string;
    UI_POOL_DATA_PROVIDER: string;
    UI_INCENTIVE_DATA_PROVIDER?: string;
    COLLECTOR?: string;
    V3_MIGRATOR?: string;
    GHO_TOKEN_ADDRESS?: string;
    GHO_UI_DATA_PROVIDER?: string;
  };
  /**
   * https://www.hal.xyz/ has integrated aave for healtfactor warning notification
   * the integration doesn't follow aave market naming & only supports a subset of markets.
   * When a halIntegration is specified a link to hal will be displayed on the ui.
   */
  halIntegration?: {
    URL: string;
    marketName: string;
  };
};

export enum CustomMarket {
  // v3 test networks, all v3.0.1 with permissioned faucet
  proto_arbitrum_goerli_v3 = "proto_arbitrum_goerli_v3",
  proto_mumbai_v3 = "proto_mumbai_v3",
  proto_fantom_testnet_v3 = "proto_fantom_testnet_v3",
  proto_fuji_v3 = "proto_fuji_v3",
  proto_goerli_v3 = "proto_goerli_v3",
  proto_optimism_goerli_v3 = "proto_optimism_goerli_v3",
  proto_scroll_alpha_v3 = "proto_scroll_alpha_v3",
  proto_sepolia_v3 = "proto_sepolia_v3",
  // v3 mainnets
  proto_mainnet_v3 = "proto_mainnet_v3",
  proto_optimism_v3 = "proto_optimism_v3",
  proto_fantom_v3 = "proto_fantom_v3",
  proto_harmony_v3 = "proto_harmony_v3",
  proto_avalanche_v3 = "proto_avalanche_v3",
  proto_polygon_v3 = "proto_polygon_v3",
  proto_arbitrum_v3 = "proto_arbitrum_v3",
  proto_metis_v3 = "proto_metis_v3",
  // v2
  proto_mainnet = "proto_mainnet",
  proto_avalanche = "proto_avalanche",
  proto_fuji = "proto_fuji",
  proto_polygon = "proto_polygon",
  proto_mumbai = "proto_mumbai",
  proto_zkevm = "proto_zkevm",
  proto_scroll_sepolia = "proto_scroll_sepolia",
  amm_mainnet = "amm_mainnet",
  proto_goerli = "proto_goerli",
  proto_sepolia = "proto_sepolia",
  // external
  // permissioned_market = 'permissioned_market',
}

const currentMarket = populateMarket();
const currentNetwork = populateChainConfigs();
// @ts-ignore
export const marketsData: {
  [key in keyof typeof CustomMarket]: MarketDataType;
} = {
  // [CustomMarket.proto_mumbai]: {
  //   marketTitle: "Polygon Mumbai",
  //   chainId: ChainId.mumbai,
  //   enabledFeatures: {
  //     incentives: true,
  //     faucet: true,
  //   },
  //   subgraphUrl:
  //     "https://api.thegraph.com/subgraphs/name/creeping-vampires/phantazm",
  //   addresses: {
  //     LENDING_POOL_ADDRESS_PROVIDER: currentMarket.POOL_ADDRESSES_PROVIDER,
  //     LENDING_POOL: currentMarket.POOL,
  //     WETH_GATEWAY: currentMarket.WETH_GATEWAY,
  //     FAUCET: currentMarket.FAUCET,
  //     WALLET_BALANCE_PROVIDER: currentMarket.WALLET_BALANCE_PROVIDER,
  //     UI_POOL_DATA_PROVIDER: currentMarket.UI_POOL_DATA_PROVIDER,
  //     UI_INCENTIVE_DATA_PROVIDER: currentMarket.UI_INCENTIVE_DATA_PROVIDER,
  //   },
  // },
  // [CustomMarket.proto_zkevm]: {
  //   marketTitle: "zkEvm Testnet Market",
  //   chainId: ChainId.zkevm_testnet,
  //   enabledFeatures: {
  //     incentives: true,
  //     faucet: true,
  //   },
  //   subgraphUrl:
  //     "https://api.thegraph.com/subgraphs/name/creeping-vampires/phantazm",
  //   addresses: {
  //     LENDING_POOL_ADDRESS_PROVIDER: currentMarket.POOL_ADDRESSES_PROVIDER,
  //     LENDING_POOL: currentMarket.POOL,
  //     WETH_GATEWAY: currentMarket.WETH_GATEWAY,
  //     FAUCET: currentMarket.FAUCET,
  //     WALLET_BALANCE_PROVIDER: currentMarket.WALLET_BALANCE_PROVIDER,
  //     UI_POOL_DATA_PROVIDER: currentMarket.UI_POOL_DATA_PROVIDER,
  //     UI_INCENTIVE_DATA_PROVIDER: currentMarket.UI_INCENTIVE_DATA_PROVIDER,
  //   },
  // },

  [CustomMarket.proto_sepolia]: {
    marketTitle: currentNetwork.name,
    chainId: currentNetwork.chainId,
    enabledFeatures: {
      incentives: true,
      faucet: true,
    },
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/creeping-vampires/phantazm",
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: currentMarket.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: currentMarket.POOL,
      WETH_GATEWAY: currentMarket.WETH_GATEWAY,
      FAUCET: currentMarket.FAUCET,
      WALLET_BALANCE_PROVIDER: currentMarket.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: currentMarket.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: currentMarket.UI_INCENTIVE_DATA_PROVIDER,
    },
  },
} as const;
