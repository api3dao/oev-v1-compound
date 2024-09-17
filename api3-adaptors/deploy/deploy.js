const hre = require("hardhat");
const fs = require("fs");

const deployEACAggregatorProxy = async (proxyAddress, assetName) => {
    const constructorArguments = [proxyAddress];
    const EACAggregatorProxy = await hre.deployments.deploy("EACAggregatorProxy", {
        args: constructorArguments,
        from: (await hre.getUnnamedAccounts())[0],
        log: true,
    });
    console.log(`Deployed EACAggregatorProxy for ${assetName} at ${EACAggregatorProxy.address}`);

    // verify
    await hre.run("verify:verify", {
        address: EACAggregatorProxy.address,
        constructorArguments: constructorArguments,
    });
    console.log(`Verified EACAggregatorProxy for ${assetName} at ${EACAggregatorProxy.address}`);

    return EACAggregatorProxy.address;
}

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

    for (const asset of config.assets) {
        // // Deploy the ERC20 asset and mint some tokens.
        // const ERC20 = await hre.deployments.deploy("ERC20Token", {
        //     // Pass in the name and symbol of your asset here
        //     args: [asset.assetName, asset.assetSymbol, asset.decimals],
        //     from: (await hre.getUnnamedAccounts())[0],
        //     log: true,
        // });
        // console.log (`Deployed ${asset.assetName} at ${ERC20.address}`);

        // // verify
        // await hre.run("verify:verify", {
        //     address: ERC20.address,
        //     constructorArguments: [asset.assetName, asset.assetSymbol, asset.decimals],
        // });
        // console.log(`Verified ${asset.assetName} at ${ERC20.address}`);

        // Deploy the EACAggregatorProxy dAPI adaptor for the asset.
        let priceFeed;
        if (asset.proxyAddress) {
            priceFeed = await deployEACAggregatorProxy(asset.proxyAddress, asset.assetName);
        } else if (asset.proxyAddresses) {
            if (asset.proxyAddresses.length != 2) {
                throw `Asset ${asset.assetSymbol} has ${asset.proxyAddresses.length} proxyAddresses, expected 2 (more than 2 is not implemented)`;
            }

            const priceFeed1 = await deployEACAggregatorProxy(asset.proxyAddresses[0], asset.proxyAddresses[0]);
            const priceFeed2 = await deployEACAggregatorProxy(asset.proxyAddresses[1], asset.proxyAddresses[1]);

            const constructorArguments = [priceFeed1, priceFeed2, asset.decimals, asset.description];
            const multiplicativePriceFeed = await hre.deployments.deploy(
                'MultiplicativePriceFeed', {
                args: constructorArguments,
                from: (await hre.getUnnamedAccounts())[0],
                log: true,
            }
            );
            console.log(`Deployed MultiplicativePriceFeed for ${asset.proxyAddresses[0]} and ${asset.proxyAddresses[1]} at ${multiplicativePriceFeed.address}`);

            // verify
            await hre.run("verify:verify", {
                address: multiplicativePriceFeed.address,
                constructorArguments: constructorArguments,
            });
            console.log(`Verified MultiplicativePriceFeed for ${asset.proxyAddresses[0]} and ${asset.proxyAddresses[1]} at ${multiplicativePriceFeed.address}`);

            priceFeed = multiplicativePriceFeed.address;
        } else {
            throw `Asset ${asset.assetSymbol} has neither proxyAddress nor proxyAddresses`;
        }

        const assetRecord = {
            assetSymbol: asset.assetSymbol,
            pairName: asset.pairName,
            decimals: asset.decimals,
            priceFeed,
            supplyCap: asset.supplyCap
        }
        if (asset.address) {
            assetRecord.address = asset.address;
        }

        deploymentsConfig.assets.push(assetRecord);
    }

    // Deploy USDC
    const USDC = await hre.deployments.deploy("ERC20Token", {
        args: ["USDC", "USDC", 6],
        from: (await hre.getUnnamedAccounts())[0],
        log: true,
    });
    deploymentsConfig['USDC'] = USDC.address;

    // Deploy EACAggregatorProxyUSDC
    const EACAggregatorProxyUSDC = await hre.deployments.deploy("EACAggregatorProxy", {
        args: [config.UsdcUsdProxyAddress],
        from: (await hre.getUnnamedAccounts())[0],
        log: true,
    });
    deploymentsConfig['EACAggregatorProxyUSDC'] = EACAggregatorProxyUSDC.address;

    // // Deploy EACAggregatorProxyWETH for WETH/USD
    // const EACAggregatorProxyWETH = await hre.deployments.deploy("EACAggregatorProxy", {
    //     args: [config.EthUsdProxyAddress],
    //     from: (await hre.getUnnamedAccounts())[0],
    //     log: true,
    // });
    // deploymentsConfig['EACAggregatorProxyWETH'] = EACAggregatorProxyWETH.address;

    // const MockWETH = await hre.deployments.deploy("MockWETH", {
    //     args: ["Mock Wrapped ETH", "WETH10"],
    //     from: (await hre.getUnnamedAccounts())[0],
    //     log: true,
    // });
    // deploymentsConfig['MockWETH'] = MockWETH.address;

    // Verify all the contracts
    await hre.run("verify:verify", {
        address: USDC.address,
        constructorArguments: ["USDC", "USDC", 6],
    });
    await hre.run("verify:verify", {
        address: EACAggregatorProxyUSDC.address,
        constructorArguments: [config.UsdcUsdProxyAddress],
    });

    fs.writeFileSync('references.json', JSON.stringify(deploymentsConfig, null, 2));
    console.log('Deployments saved to references.json');
};

module.exports.tags = ['deployDapiAdapter'];