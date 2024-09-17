import config from "deployment-configs.json";

import { zeroAddress } from "viem";

const deploymentConfig: any = config;

export const populateChainConfigs = () => {
  try {
    let config: any = {};

    let currentMarket = !deploymentConfig.currentMarket
      ? "aave"
      : deploymentConfig.currentMarket;

    const _deploymentConfig = deploymentConfig?.[currentMarket];

    if (!_deploymentConfig?.config) {
      console.log("using default chains");
      config.chainId = 421614;
      config.name = "Arbitrum Sepolia";
      config.rpc = "https://sepolia-rollup.arbitrum.io/rpc";
      config.nativeCurrency = {
        name: "Ether",
        symbol: "ETH",
        wrapped: "WETH",
        decimals: 18,
      };

      config.explorerLink = "https://sepolia.arbiscan.io";
      config.currentMarket = currentMarket;

      return config;
    }

    // read generated configs
    config.chainId = _deploymentConfig.config.network.chainId;
    config.name = _deploymentConfig.config.network.name;
    config.rpc = _deploymentConfig.config.network.rpc;
    config.nativeCurrency = _deploymentConfig.config.network.nativeCurrency;
    config.explorerLink = _deploymentConfig.config.network.explorerLink;
    config.currentMarket = currentMarket;

    return config;
  } catch (error) {
    console.log("Failed to read deploye contracts file", error);
    return {};
  }
};

export const populateAssetIcon = (symbol: string): string => {
  return "/images/logo-icon.svg";
};

// populate aave market contracts from deployment-config.json
export const populateMarket = () => {
  let contracts;

  let currentMarket = deploymentConfig.currentMarket;

  const _deploymentConfig = deploymentConfig?.[currentMarket];

  if (!_deploymentConfig?.["deployed-contracts"]) {
    console.log("using default contracts");

    return {
      POOL_ADDRESSES_PROVIDER: "0x07E8Be3643A4CAbF17a06bA28057DaC550Be4DaB",
      POOL: "0x2eC72aE78aa2443a7BF8fA3252919a8727266CaD",
      WETH_GATEWAY: "0x532D1953B697cfed8fE11fBb83f349B2849313e4",
      FAUCET: zeroAddress,
      WALLET_BALANCE_PROVIDER: "0xdaF92e3b1a93e0B70Ffd2710013F3D889155af37",
      UI_POOL_DATA_PROVIDER: "0x925eFE8Bd5b492Fe843e824b098958419ec37b62",
      UI_INCENTIVE_DATA_PROVIDER: "0x97AC14EF3C5792658640d5680A85673BE25BD3F8",
    };
  }
  console.log("using cli contracts");

  // read config from cli
  contracts = _deploymentConfig?.["deployed-contracts"];

  const market = {
    POOL_ADDRESSES_PROVIDER:
      contracts?.LendingPoolAddressesProvider?.custom?.address,
    POOL: contracts?.LendingPool?.custom?.address,
    WETH_GATEWAY: contracts?.WETHGateway?.custom?.address,
    FAUCET: zeroAddress,
    WALLET_BALANCE_PROVIDER: contracts?.WalletBalanceProvider?.custom?.address,
    UI_POOL_DATA_PROVIDER: contracts?.UiPoolDataProvider?.custom?.address,
    UI_INCENTIVE_DATA_PROVIDER:
      contracts?.UiIncentiveDataProviderV2V3?.custom?.address,
  };

  return market;
};

// populate aave market contracts from deployment-config.json
export const populateCompoundMarket = () => {
  let currentMarket = "compound";

  const _deploymentConfig =
    deploymentConfig?.[currentMarket]?.["deployed-contracts"];

  if (!_deploymentConfig) {
    // return a default contracts
    return {
      fauceteer: "0x1591D0b23174d874eA3c00A401Ed40B8f6f406e4",
      timelock: "0x529b627C260812b29f6a282345E5B140f1f7A927",
      COMP: "0xa00C08439595a685b3696CB322F3FAAdbd4F4eD0",
      "governor:implementation": "0x8c7fba1C054bAE7745feC3ee8E2486deA78d57A7",
      governor: "0x4D87F098a261FE0537Da0bCfE2D9c74a05F94F56",
      WBTC: "0x87ea1Ba65F51b96Cc5aebE8cf3Ef6377F3E48ef7",
      WETH: "0x8F7863D888752cb312385433f9caeA921217B7A9",
      USDC: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      cometAdmin: "0x2fBe3d5Cba1A43804c1365db89ba76397673A76b",
      "comet:implementation:implementation":
        "0x472A828d413caac050b39E05CC3E23713d694F50",
      cometFactory: "0x5D777A696CC1853a431C8D6A6a6e173304C6DaC4",
      "comet:implementation": "0x17B92aD13924C377Af1915d60Fb35bF3DDe77ed1",
      comet: "0xf1321d893722b66680Ebb2CA56Ea0549A6557e74",
      "configurator:implementation":
        "0xF13f86a8100BCBA5C1b1EAa21e3A8847fD3d89A1",
      configurator: "0x6bEf3B20d32E1dce94A1f2dFC2391f90887d4fE0",
      rewards: "0x0A8c044ae869a509AF681c2ba9e0f3561f230e02",
      bulker: "0x77c9Fe5a6721A3bC8DDbD1AE271cef58a1efE9b3",
      priceFeeds: {
        COMP: "0x302C053a2139Ee9028b500E7da056B6b4169B4Fa",
        WBTC: "0x5EF17889992f6d9daCEb03db9822AA5b6fDd6713",
        WETH: "0x132e2459498CFfb3f767d508066bf1dF0549D59C",
        ARB: "0xf689D4e1d0B5B7281974389a58D65DE4722f046C",
        USDC: "0x683Ae71AFB633385e64a7968435210d1aadbe29D",
      },
      marketAsset: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    };
  }

  return {
    fauceteer: _deploymentConfig.fauceteer,
    timelock: _deploymentConfig.timelock,
    COMP: _deploymentConfig.COMP,
    governor: _deploymentConfig.governor,
    WBTC: _deploymentConfig.WBTC,
    WETH: _deploymentConfig.WETH,
    USDC: _deploymentConfig.USDC,
    cometAdmin: _deploymentConfig.cometAdmin,
    cometFactory: _deploymentConfig.cometFactory,
    comet: _deploymentConfig.comet,
    configurator: _deploymentConfig.configurator,
    rewards: _deploymentConfig.rewards,
    bulker: _deploymentConfig.bulker,
    priceFeeds: _deploymentConfig.priceFeeds,
    marketAsset: _deploymentConfig.USDC,
  };
};
