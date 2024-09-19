require('@nomiclabs/hardhat-waffle');
require('hardhat-deploy');
require('@nomicfoundation/hardhat-verify');

require('dotenv').config({path: '../.env'});

const fs = require('fs');
let config = require('./config.json');

module.exports = {
  networks: {
    base: {
      url: config.network.rpc,
      chainId: config.network.chainId,
      accounts: {
        mnemonic: process.env.MNEMONIC
      }
    }
  },
  etherscan: {
    apiKey: process.env.BASESCAN_KEY
  },
  solidity: {
    version: '0.8.17',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};