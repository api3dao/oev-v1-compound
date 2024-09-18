const hre = require('hardhat');
const fs = require('fs');

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
      priceFeed = await deployApi3ReaderProxyV1(api3ReaderProxyV1Factory, asset.dapiName);
    } else if (asset.dapiNames) {
      if (asset.dapiNames.length != 2) {
        throw `Asset ${asset.assetSymbol} has ${asset.dapiNames.length} dapiNames, expected 2 (more than 2 is not implemented)`;
      }

      const priceFeed1 = await deployApi3ReaderProxyV1(api3ReaderProxyV1Factory, asset.dapiNames[0]);
      const priceFeed2 = await deployApi3ReaderProxyV1(api3ReaderProxyV1Factory, asset.dapiNames[1]);

      const constructorArguments = [priceFeed1, priceFeed2, asset.decimals, asset.description];
      const multiplicativePriceFeed = await hre.deployments.deploy(
        'MultiplicativePriceFeed', {
          args: constructorArguments,
          from: (await hre.getUnnamedAccounts())[0],
          log: true,
        }
      );
      console.log(`Deployed MultiplicativePriceFeed for ${asset.dapiNames[0]} and ${asset.dapiNames[1]} at ${multiplicativePriceFeed.address}`);

      // verify
      try{
        await hre.run('verify:verify', {
          address: multiplicativePriceFeed.address,
          constructorArguments: constructorArguments,
        });
        console.log(`Verified MultiplicativePriceFeed for ${asset.dapiNames[0]} and ${asset.dapiNames[1]} at ${multiplicativePriceFeed.address}`);
      } catch (err) {
        console.error('Error verifying MultiplicativePriceFeed:', err);
      }

      priceFeed = multiplicativePriceFeed.address;
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

  // Deploy Api3ReaderProxyV1 for USDC/USD
  const usdcApi3ReaderProxyV1 = await deployApi3ReaderProxyV1(api3ReaderProxyV1Factory, 'USDC/USD');
  deploymentsConfig['usdcApi3ReaderProxyV1'] = usdcApi3ReaderProxyV1;

  fs.writeFileSync('references.json', JSON.stringify(deploymentsConfig, null, 2));
  console.log('Deployments saved to references.json');
};

module.exports.tags = ['deployDapiAdapter'];