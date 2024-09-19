import baseRelationConfig from '../../relations';
import fs from 'fs';
import path from 'path';

const configuration = JSON.parse(fs.readFileSync(path.join(__dirname, 'configuration.json'), 'utf8'));

let priceFeeds = {};

for (let assetName in configuration.assets) {
  priceFeeds[configuration.assets[assetName].priceFeed] = {
    artifact: 'contracts/IPriceFeed.sol:IPriceFeed'
  };
}

export default {
  ...baseRelationConfig,
  ...priceFeeds,
  fxRoot: {
    relations: {
      stateSender: {
        field: async fxRoot => fxRoot.stateSender()
      }
    }
  },
  arbitrumInbox: {
    delegates: {
      field: {
        slot: '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc'
      }
    },
    relations: {
      arbitrumBridge: {
        field: async inbox => inbox.bridge()
      }
    }
  },
  arbitrumL1GatewayRouter: {
    delegates: {
      field: {
        slot: '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc'
      }
    }
  },
  baseL1CrossDomainMessenger: {
    delegates: {
      // Not great, but this address shouldn't change and is very difficult to grab on-chain (private methods)
      field: async () => '0xa042e16781484716c1Ef448c919af7BCd9607467'
    }
  },
  baseL1StandardBridge: {
    delegates: {
      field: {
        slot: '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc'
      }
    }
  },
  lineaMessageService: {
    artifact: 'contracts/bridges/linea/IMessageService.sol:IMessageService',
    // delegates: {
    //   field: {
    //     slot: '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc'
    //   }
    // }
  },
  lineaL1TokenBridge: {
    delegates: {
      field: {
        slot: '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc'
      }
    }
  },
  lineaL1usdcBridge: {
    delegates: {
      field: {
        slot: '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc'
      }
    }
  },
  Proxy: {
    artifact: 'contracts/ERC20.sol:ERC20',
    delegates: {
      field: {
        slot: '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc'
      }
    }
  },
  OssifiableProxy: {
    artifact: 'contracts/ERC20.sol:ERC20',
    delegates: {
      field: {
        slot: '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc'
      }
    }
  }
};
