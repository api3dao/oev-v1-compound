# Compound v3: Comet

This repository contains the smart contracts source code and market configurations for Compound v3(comet).

This forked version of comet uses API3's dAPIs for data feeds for assets. Check out the API3 documentation [here](https://docs.api3.org/). 

## Deploying the protocol

### Deploying the adaptors

`/api3-adaptors` contains the necessary scripts to deploy and add the API3 Aggregator Adaptors and assets required for the protocol deployment.

- Install all the packages for the adaptors:

```bash
yarn adaptors:build
```

- Open `api3-adaptors/config.json` and add your asset and network details. You also need proxy contract address for each asset you are going to add. Head over to the [API3 Market](https://market.api3.org/) and get the proxy contract address for the assets you want to add.

You can also check out [this guide](https://docs.api3.org/guides/dapis/subscribing-to-dapis/) on subscribing to dAPIs and getting a proxy address.
For now, only 3 assets are supported. Do not add any more assets in the config.

*NOTE: It is advisable to use a private RPC for the deployments. If the protocol deployment fails, try using another RPC.*

Make a `.env` file in the root and add your mnemonic. This wallet needs to be funded to cover the gas costs for the deployments. Also add the other environment variables in the `.env` file. Make sure to add the `ETHERSCAN_KEY`(FOR MAINNET).

```bash
ETHERSCAN_KEY=""
BASESCAN_KEY="api-key"
SNOWTRACE_KEY="api-key"
INFURA_KEY="api-key"
POLYGONSCAN_KEY="api-key"
ARBISCAN_KEY="api-key"
LINEASCAN_KEY="api-key"
OPTIMISMSCAN_KEY="api-key"
MNEMONIC=""
```

Run the following command to deploy the adaptors:

```bash
yarn adaptors:deploy
```

### Deploying the protocol

After deploying the adaptors, you can deploy the protocol. Install all the packages for the protocol:

```bash
yarn
```

Build all the packages:

```bash
yarn build
```

Run the following command to deploy the protocol:

```bash
NETWORK=your-network yarn protocol:deploy
```

This would deploy Compound V3 USDC Market on your desired chain with all the collateral assets defined in the `api3-adaptors/config.json` file.

## Spinning up the frontend

After the deployment, you can spin up the frontend to interact with the protocol. Install all the packages for the frontend:

```bash
yarn frontend:codegen
```

Run the following command to start the frontend:

```bash
yarn frontend:dev
```