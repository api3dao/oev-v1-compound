const fs = require("fs");

const config = JSON.parse(
  fs.readFileSync("api3-adaptors/config.json", "utf8")
);

const aliases = JSON.parse(
  fs.readFileSync(`deployments/${config.network.name}/usdc/aliases.json`, "utf8")
);
const configuration = JSON.parse(
  fs.readFileSync(`deployments/${config.network.name}/usdc/configuration.json`, "utf8")
);

let frontendConfig = {
  currentMarket: "compound",
  compound: {
    config: {
      baseToken: configuration.baseTokenAddress,
      rewardToken: configuration?.assets?.[configuration.rewardToken].address,
      network: {
        chainId: config.network.chainId,
        name: config.network.name,
        rpc: config.network.rpc,
        nativeCurrency: config.network.nativeCurrency,
        explorerLink: config.network.explorerLink,
      },
    },
    "deployed-contracts": {
      ...aliases,
      USDC: configuration.baseTokenAddress,
      priceFeeds: {},
    },
  },
};

for (let assetSymbol in configuration.assets) {
  // Add the asset to the frontendConfig
  // frontendConfig.config.assets.push({
  //   symbol: assetSymbol,
  //   address: configuration.assets[assetSymbol].address,
  //   priceFeed: configuration.assets[assetSymbol].priceFeed,
  //   decimals: configuration.assets[assetSymbol].decimals,
  // });
  frontendConfig.compound["deployed-contracts"].priceFeeds[assetSymbol] =
    configuration.assets[assetSymbol].priceFeed;
}
// add base token price feed
frontendConfig.compound["deployed-contracts"].priceFeeds[
  configuration.baseToken
] = configuration.baseTokenPriceFeed;
// Write the frontendConfig to a new JSON file
fs.writeFileSync(
  "api3-aave-ui/deployment-configs.json",
  JSON.stringify(frontendConfig, null, 2)
);
