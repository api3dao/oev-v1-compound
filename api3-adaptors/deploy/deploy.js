const hre = require('hardhat');
const fs = require('fs');

// Compound requires the price feeds to have 8 decimals
const COMPOUND_PRICE_FEED_DECIMALS = 8;

const deployApi3ReaderProxyV1 = async (api3ReaderProxyV1Factory, dapiName) => {
  const dapiNameBytes = hre.ethers.utils.formatBytes32String(dapiName);
  const dappId = 1;
  const api3ReaderProxyV1Metadata = '0x';
  const expectedApi3ReaderProxyV1Address = await api3ReaderProxyV1Factory.computeApi3ReaderProxyV1Address(
    dapiNameBytes,
    dappId,
    api3ReaderProxyV1Metadata
  );
  if ((await hre.ethers.provider.getCode(expectedApi3ReaderProxyV1Address)) === '0x') {
    await api3ReaderProxyV1Factory.deployApi3ReaderProxyV1(dapiNameBytes, dappId, api3ReaderProxyV1Metadata);
    console.log(`Deployed Api3ReaderProxyV1 for ${dapiName} at ${expectedApi3ReaderProxyV1Address}`);
  } else {
    console.log(`Api3ReaderProxyV1 for ${dapiName} already deployed at ${expectedApi3ReaderProxyV1Address}`);
  }

  return expectedApi3ReaderProxyV1Address;
};

const deployScalingPriceFeed = async (underlyingPriceFeed, decimals, dapiName) => {
  const constructorArguments = [underlyingPriceFeed, decimals];
  const scalingPriceFeed = await hre.deployments.deploy(
    'ScalingPriceFeed', {
      args: constructorArguments,
      from: (await hre.getUnnamedAccounts())[0],
      log: true,
    }
  );
  console.log(`Deployed ScalingPriceFeed for ${dapiName} at ${scalingPriceFeed.address}`);

  // verify
  try{
    await hre.run('verify:verify', {
      address: scalingPriceFeed.address,
      constructorArguments: constructorArguments,
    });
    console.log(`Verified ScalingPriceFeed for ${dapiName} at ${scalingPriceFeed.address}`);
  } catch (err) {
    console.error('Error verifying ScalingPriceFeed:', err);
  }

  return scalingPriceFeed.address;
};

const deployMultiplicativePriceFeed = async (priceFeed1, priceFeed2, decimals, description, dapiName1, dapiName2) => {
  const constructorArguments = [priceFeed1, priceFeed2, decimals, description];
  const multiplicativePriceFeed = await hre.deployments.deploy(
    'MultiplicativePriceFeed', {
      args: constructorArguments,
      from: (await hre.getUnnamedAccounts())[0],
      log: true,
    }
  );
  console.log(`Deployed MultiplicativePriceFeed for ${dapiName1} and ${dapiName2} at ${multiplicativePriceFeed.address}`);

  // verify
  try{
    await hre.run('verify:verify', {
      address: multiplicativePriceFeed.address,
      constructorArguments: constructorArguments,
    });
    console.log(`Verified MultiplicativePriceFeed for ${dapiName1} and ${dapiName2} at ${multiplicativePriceFeed.address}`);
  } catch (err) {
    console.error('Error verifying MultiplicativePriceFeed:', err);
  }

  return multiplicativePriceFeed.address;
};

module.exports = async () => {
  let data = fs.readFileSync('./config.json', 'utf8');
  let config;
  try {
    config = JSON.parse(data);
  }
  catch (err) {
    console.error('Error parsing config file:', err);
    return;
  }
  let deploymentsConfig = {
    assets: []
  };

  const api3ReaderProxyV1FactoryAbiJson = fs.readFileSync('./abis/Api3ReaderProxyV1Factory.json', 'utf8');
  let api3ReaderProxyV1FactoryAbi;
  try {
    api3ReaderProxyV1FactoryAbi = JSON.parse(api3ReaderProxyV1FactoryAbiJson);
  }
  catch (err) {
    console.error('Error parsing config file:', err);
    return;
  }
  const api3ReaderProxyV1Factory = new hre.ethers.Contract(
    config.api3ReaderProxyV1FactoryAddress,
    api3ReaderProxyV1FactoryAbi,
    (await hre.ethers.getSigners())[0]
  );

  for (const asset of config.assets) {
    // Deploy the Api3ReaderProxyV1 for the asset.
    let priceFeed;
    if (asset.dapiName) {
      const proxyPriceFeed = await deployApi3ReaderProxyV1(api3ReaderProxyV1Factory, asset.dapiName);
      priceFeed = await deployScalingPriceFeed(proxyPriceFeed, COMPOUND_PRICE_FEED_DECIMALS, asset.dapiName);
    } else if (asset.dapiNames) {
      if (asset.dapiNames.length != 2) {
        throw `Asset ${asset.assetSymbol} has ${asset.dapiNames.length} dapiNames, expected 2 (more than 2 is not implemented)`;
      }

      const priceFeed1 = await deployApi3ReaderProxyV1(api3ReaderProxyV1Factory, asset.dapiNames[0]);
      const priceFeed2 = await deployApi3ReaderProxyV1(api3ReaderProxyV1Factory, asset.dapiNames[1]);

      priceFeed = await deployMultiplicativePriceFeed(priceFeed1, priceFeed2, COMPOUND_PRICE_FEED_DECIMALS, asset.description, asset.dapiNames[0], asset.dapiNames[1]);
    } else {
      throw `Asset ${asset.assetSymbol} has neither dapiName nor dapiNames`;
    }

    const assetRecord = {
      assetSymbol: asset.assetSymbol,
      pairName: asset.pairName,
      decimals: asset.decimals,
      priceFeed,
      supplyCap: asset.supplyCap
    };
    if (asset.address) {
      assetRecord.address = asset.address;
    }

    deploymentsConfig.assets.push(assetRecord);
  }

  deploymentsConfig['USDC'] = config.USDC;

  // Deploy price feed for USDC/USD
  const usdcApi3ReaderProxyV1 = await deployApi3ReaderProxyV1(api3ReaderProxyV1Factory, 'USDC/USD');
  const usdcPriceFeed = await deployScalingPriceFeed(usdcApi3ReaderProxyV1, COMPOUND_PRICE_FEED_DECIMALS, 'USDC/USD');
  deploymentsConfig['USDCPriceFeed'] = usdcPriceFeed;

  fs.writeFileSync('references.json', JSON.stringify(deploymentsConfig, null, 2));
  console.log('Deployments saved to references.json');
};

module.exports.tags = ['deployDapiAdapter'];