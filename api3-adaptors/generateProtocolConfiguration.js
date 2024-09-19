const fs = require('fs');

const references = JSON.parse(fs.readFileSync('references.json', 'utf8'));
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

// base config
let configuration = {
  "name": "Compound USDC",
  "symbol": "cUSDCv3",
  "baseToken": "USDC",
  "baseTokenAddress": references.USDC,
  "baseTokenPriceFeed": references.USDCPriceFeed,
  "pauseGuardian": "0x008a4C5448ac1Df676d6F39A0C6F13b21b189389",
  "borrowMin": "1e0",
  "storeFrontPriceFactor": 0.5,
  "targetReserves": "5000000e6",
  "rates": {
    "supplyKink": 0.85,
    "supplySlopeLow": 0.048,
    "supplySlopeHigh": 1.6,
    "supplyBase": 0,
    "borrowKink": 0.85,
    "borrowSlopeLow": 0.053,
    "borrowSlopeHigh": 1.7,
    "borrowBase": 0.015
  },
  "tracking": {
    "indexScale": "1e15",
    "baseSupplySpeed": "0.000011574074074074073e15",
    "baseBorrowSpeed": "0.0011458333333333333e15",
    "baseMinForRewards": "100e6"
  },
  "assets": {}
};

for (let asset of references.assets) {
  const assetRecord = {
    "priceFeed": asset.priceFeed,
    "decimals": asset.decimals,
    "borrowCF": 0.75,
    "liquidateCF": 0.7501,
    "liquidationFactor": 0.93,
    "supplyCap": asset.supplyCap
  };
  if (asset.address) {
    assetRecord.address = asset.address;
  }
  configuration.assets[asset.assetSymbol] = assetRecord;
}

fs.writeFileSync(`../deployments/${config.network.name}/usdc/configuration.json`, JSON.stringify(configuration, null, 2));