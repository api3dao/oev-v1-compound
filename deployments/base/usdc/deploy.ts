import { Deployed, DeploymentManager } from '../../../plugins/deployment_manager';
import { DeploySpec, cloneGov, deployComet, exp, sameAddress, wait } from '../../../src/deploy';

const WETH = '0x4200000000000000000000000000000000000006';

export default async function deploy(deploymentManager: DeploymentManager, deploySpec: DeploySpec): Promise<Deployed> {
  const deployed = await deployContracts(deploymentManager, deploySpec);
  return deployed;
}

async function deployContracts(deploymentManager: DeploymentManager, deploySpec: DeploySpec): Promise<Deployed> {
  const trace = deploymentManager.tracer();
  const signer = await deploymentManager.getSigner();

  // Deploy governance contracts
  const { COMP, fauceteer, timelock } = await cloneGov(deploymentManager);

  // // ADD CUSTOM TOKENS
  // const ARB = await deploymentManager.existing('ARB', '0x117e85D7FA75fFd5Af908E952bAE62b74613eD82', 'sepolia', 'contracts/ERC20.sol:ERC20');

  // Deploy all Comet-related contracts
  const deployed = await deployComet(deploymentManager, deploySpec);
  const { rewards } = deployed;

  // Deploy Bulker
  const bulker = await deploymentManager.deploy(
    'bulker',
    'bulkers/BaseBulker.sol',
    [timelock.address, WETH]
  );

  await deploymentManager.idempotent(
    async () => (await COMP.balanceOf(rewards.address)).eq(0),
    async () => {
      trace(`Sending some COMP to CometRewards`);
      const amount = exp(1_000_000, 18);
      trace(await wait(COMP.connect(signer).transfer(rewards.address, amount)));
      trace(`COMP.balanceOf(${rewards.address}): ${await COMP.balanceOf(rewards.address)}`);
      trace(`COMP.balanceOf(${signer.address}): ${await COMP.balanceOf(signer.address)}`);
    }
  );

  return { ...deployed, fauceteer, bulker };
}