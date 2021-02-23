const fs = require('fs-extra');
const mustache = require('mustache');

const {
  ETH_RPC_URL
} = process.env

if(!ETH_RPC_URL) {
  throw new Error("ETH_RPC_URL must be defined")
}


// --------
// Resolver
// --------

// Resolve from a networks.json file.
interface ContractDeployment {
  address: string
  blockNumber: string
}
abstract class ContractResolver {
  abstract resolve(contract: string): ContractDeployment
}

class DeploymentsJsonResolver implements ContractResolver {
  deployments: any
  networkId: number

  constructor(networkId, path) {
    try {
      this.networkId = networkId
      this.deployments = require(path)
    } catch(ex) {
      throw new Error(`Could not find deployments.json at ${path}`)
    }
  }

  resolve(contract) {
    let data: ContractDeployment
    try {
      data = this.deployments[this.networkId][contract]
    } catch(ex) {
      throw new Error(`Could not resolve contract ${contract} from deployments: ${ex.toString()}`)
    }
    return data
  }
}

// class GanacheArtifactResolver implements ContractResolver {
//   path: string
//   networkId: number

//   constructor(networkId, path) {
//     this.networkId = networkId
//     this.path = path
//   }

//   resolve(contract: string) {
//     let address: string
//     let artifactPath = `${this.path}/${contract}.json`
//     try {
//       const artifact = require(artifactPath)
//       address = artifact.networks[this.networkId].address
//     } catch(ex) {
//       throw new Error(`Could not resolve contract ${contract} from Ganache artifact at ${artifactPath}`)
//     }
//     return address
//   }
// }


import { join } from 'path'
import { ethers } from 'ethers'






async function main() {
    const provider = new ethers.providers.JsonRpcProvider(ETH_RPC_URL)
    let network = await provider.getNetwork()
    let chainId = network.chainId

    const templateData = {
      network: {
        [1]: 'mainnet',
        [42]: 'mainnet',
        [4]: 'rinkeby',
        [77]: 'poa-sokol',
        [100]: 'xdai',
      }[chainId] || 'mainnet'
    };

    const contracts = [
      'Curatem'
    ]
    let resolver: ContractResolver = new DeploymentsJsonResolver(chainId, join(__dirname, '../curatem-contracts/deployments.json'))

    for(const contractName of contracts) {
      const { address, blockNumber } = resolver.resolve(contractName)
        templateData[contractName] = {
          address,
          addressLowerCase: address.toLowerCase(),
          startBlock: blockNumber
        }
    }

    for (const templatedFileDesc of [
      ['subgraph', 'yaml'],
      // ['src/utils/token', 'ts'],
      // ['src/FPMMDeterministicFactoryMapping', 'ts'],
      // ['src/ConditionalTokensMapping', 'ts'],
      // ['src/RealitioMapping', 'ts'],
      // ['src/UniswapV2PairMapping', 'ts'],
    ]) {
      const template = fs.readFileSync(`${templatedFileDesc[0]}.template.${templatedFileDesc[1]}`).toString();
      fs.writeFileSync(
        `${templatedFileDesc[0]}.${templatedFileDesc[1]}`,
        mustache.render(template, templateData),
      );
    }
    
  }


module.exports = main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
