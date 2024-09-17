import { populateChainConfigs, populateCompoundMarket } from "configuration";
import { Contract } from "ethers";
import { formatUnits, parseUnits } from "viem";
import cometABI from "../abis/comet.json";
import { erc20ABI } from "wagmi";

const compoundMarket = populateCompoundMarket();
const compoundChainConfig = populateChainConfigs();

export async function getPrices(comet: any) {
  const compoundMarket = populateCompoundMarket();

  let [compPrice, wbtcPrice, wethPrice, usdcPrice] = await Promise.all([
    comet.callStatic.getPrice(compoundMarket.priceFeeds.COMP),
    comet.callStatic.getPrice(compoundMarket.priceFeeds.WBTC),
    comet.callStatic.getPrice(compoundMarket.priceFeeds.WETH),
    comet.callStatic.getPrice(compoundMarket.priceFeeds.USDC),
  ]);
  wbtcPrice /= Math.pow(10, 8);

  usdcPrice /= Math.pow(10, 8);

  wethPrice /= Math.pow(10, 8);
  compPrice /= Math.pow(10, 8);

  console.log({ compPrice, usdcPrice, wbtcPrice, wethPrice });
  return [compPrice, wbtcPrice, wethPrice, usdcPrice];
}

export async function getBorrowCapacity(
  account: string,
  numAssets: number,
  infos: any[],
  provider: any,
) {
  console.log("compound state test ", account);
  try {
    const _cometAbi = [
      "function numAssets() returns (uint8)",
      "function getAssetInfo(uint8 i) public view returns (tuple(uint8 offset, address asset, address priceFeed, uint64 scale, uint64 borrowCollateralFactor, uint64 liquidateCollateralFactor, uint64 liquidationFactor, uint128 supplyCap) memory)",
      "function collateralBalanceOf(address account, address asset) external view returns (uint128)",
      "function getPrice(address priceFeed) public view returns (uint128)",
      "function baseTokenPriceFeed() public view returns (address)",
      "function borrowBalanceOf(address account) external view returns (uint256)",
      "function decimals() external view returns (uint)",
      "function userBasic(address) public returns (tuple(int104 principal, uint64 baseTrackingIndex, uint64 baseTrackingAccrued, uint16 assetsIn, uint8 _reserved) memory)",
    ];

    const comet = new Contract(compoundMarket.comet, _cometAbi, provider);

    const myAddress = account;

    // const numAssets = await comet.callStatic.numAssets();

    // const promisesAssets = [];
    // for (let i = 0; i < numAssets; i++) {
    //   promisesAssets.push(comet.callStatic.getAssetInfo(i));
    // }

    // const infos = await Promise.all(promisesAssets);

    const promisesCollaterals = [];
    const promisesDecimals = [];
    const promisesPrices = [];
    for (let i = 0; i < numAssets; i++) {
      const { asset, priceFeed } = infos[i];
      promisesCollaterals.push(
        comet.callStatic.collateralBalanceOf(myAddress, asset),
      );
      promisesPrices.push(comet.callStatic.getPrice(priceFeed));
    }

    const collateralBalances = await Promise.all(promisesCollaterals);
    const collateralPrices = await Promise.all(promisesPrices);

    const baseTokenPriceFeed = await comet.callStatic.baseTokenPriceFeed();
    const basePrice =
      +(await comet.callStatic.getPrice(baseTokenPriceFeed)).toString() / 1e8;
    const baseDecimals = +(await comet.callStatic.decimals()).toString();

    let collateralValueUsd = 0;
    let totalBorrowCapacityUsd = 0;
    let borrowCapacities = [];

    for (let i = 0; i < numAssets; i++) {
      const balance =
        +collateralBalances[i].toString() / +infos[i].scale.toString();
      const price = +collateralPrices[i].toString() / 1e8;
      collateralValueUsd += balance * price;
      totalBorrowCapacityUsd +=
        balance * price * (+infos[i].borrowCollateralFactor.toString() / 1e18);

      borrowCapacities[infos[i].asset] = totalBorrowCapacityUsd / price;
    }

    const borrowBalance = +(
      await comet.callStatic.borrowBalanceOf(myAddress)
    ).toString();
    const borrowedInUsd =
      (borrowBalance / Math.pow(10, baseDecimals)) * basePrice;

    const borrowCapacityUsd = totalBorrowCapacityUsd - borrowedInUsd;

    // console.log("\tMaximum borrowable amount (USD)", borrowCapacityUsd);
    // console.log("\tAlready Borrowed amount (USD)", borrowedInUsd);

    const borrowCapacityBase = borrowCapacityUsd / basePrice;
    const borrowedInBase = borrowedInUsd / basePrice;
    // console.log("\tMaximum borrowable amount (base)", borrowCapacityBase);
    // console.log("\tAlready Borrowed amount (base)", borrowedInBase);
    // console.log("all assets borrow capacites ", {
    //   borrowCapacities,
    // });

    return { borrowedInBase, borrowCapacityBase };
  } catch (error) {
    console.log("getBorrowCapacity error ", error);

    return {};
  }
}

export async function getAllAssets(commet: any) {
  const numAssets = await commet.numAssets();
  const indexes = [];
  for (let i = 0; i < numAssets; i++) indexes.push(i);
  const promises = indexes.map((index) => commet.getAssetInfo(index));
  const assets = await Promise.all([...promises]);

  return assets;
}

export async function getBaseAssetSupply(comet: any, account: string) {
  try {
    const info = await comet.userBasic(account);
    const supplied = info?.principal?.toString();
    return supplied;
  } catch (error) {
    console.log("error getBaseAssetSupply", error);
    return "0";
  }
}

export async function getTokenAprovalAmount(
  account: string,
  spender: string,
  tokenAddresses: string,
  provider: any,
) {
  try {
    const erc20Contract = new Contract(tokenAddresses, erc20ABI, provider);
    const [allowance, decimals] = await Promise.all([
      erc20Contract.allowance(account, spender),
      erc20Contract.decimals(),
    ]);
    return formatUnits(allowance.toString(), decimals);
  } catch (error) {
    console.log("getTokenApproval amount ", error);
    return 0;
  }
}

export async function getApprovalTransactionData(
  token: string,
  spender: string,
  amount: string,
  provider: any,
) {
  try {
    const tokenContract = new Contract(token, erc20ABI, provider);

    const tx = await tokenContract.populateTransaction.approve(spender, amount);

    return tx;
  } catch (error) {
    console.log("compound getApprovalTransactionData error ", error);

    return {};
  }
}

export async function getSupplyTransactionData(
  comet: string,
  token: string,
  amount: string,
  provider: any,
) {
  try {
    const cometContract = new Contract(comet, cometABI, provider);

    const tx = await cometContract.populateTransaction.supply(token, amount);

    return tx;
  } catch (error) {
    console.log("compound supply error ", error);

    return error;
  }
}

export async function getWithdrawTransactionData(
  comet: string,
  token: string,
  amount: string,
  provider: any,
) {
  try {
    const cometContract = new Contract(comet, cometABI, provider);
    console.log("withdraw test token ", token);
    const tx = await cometContract.populateTransaction.withdraw(token, amount);

    return tx;
  } catch (error) {
    console.log("withdraw test getWithdrawTransactionData  error ", error);

    return error;
  }
}

export async function getTokenInfo(
  address: string,
  provider: any,
  account: string,
) {
  const compoundMarket = populateCompoundMarket();
  const erc20Contract = new Contract(address, erc20ABI, provider);
  const comet = new Contract(compoundMarket.comet, cometABI, provider);

  try {
    const [name, symbol, decimals, balance, supplied] = await Promise.all([
      erc20Contract.name(),
      erc20Contract.symbol(),
      erc20Contract.decimals(),
      erc20Contract.balanceOf(account),
      address === compoundMarket.USDC
        ? comet.userBasic(account)
        : comet.userCollateral(account, address),
    ]);
    // console.log("info test ", { name, symbol, decimals, balance, supplied });

    return {
      name,
      symbol,
      decimals,
      address,
      balance: balance.toString(),
      formatBalance: formatUnits(balance.toString(), decimals),
      supplied:
        address === compoundMarket.USDC
          ? formatUnits(supplied?.principal?.toString(), decimals)
          : formatUnits(supplied?.balance?.toString(), decimals),
    };
  } catch (error) {
    console.log("getTokenInfo error ", error);
    return {};
  }
}

export async function getSupplyAPR(comet: any) {
  const secondsPerYear = 60 * 60 * 24 * 365;
  const utilization = await comet.getUtilization();
  const supplyRate = await comet.getSupplyRate(utilization);
  const supplyApr = (+supplyRate.toString() / 1e18) * secondsPerYear * 100;

  console.log({ supplyApr, utilization: utilization.toString(), supplyRate });
  return supplyApr;
}

export async function getBorrowAPR(comet: any) {
  const secondsPerYear = 60 * 60 * 24 * 365;
  const utilization = await comet.getUtilization();
  const borrowRate = await comet.getBorrowRate(utilization);
  const borrowApr = (+borrowRate.toString() / 1e18) * secondsPerYear * 100;

  return borrowApr;
}

export async function getTotalReserves(provider: any) {
  const _cometAbi = ["function getReserves() returns (uint8)"];

  const comet = new Contract(compoundMarket.comet, _cometAbi, provider);

  const reserves = await comet.callStatic.getReserves();

  return reserves;
}

export async function compRewardApr(comet: any) {
  try {
    const compoundMarket = populateCompoundMarket();

    const priceFeedMantissa = 1e8;
    const usdcMantissa = 1e6;
    const secondsPerDay = 60 * 60 * 24;
    const daysInYear = 365;

    let [baseIndexScale, totalSupply, totalBorrow, baseTokenPriceFeed] =
      await Promise.all([
        comet.baseIndexScale(), // Converts the value to a number
        comet.totalSupply(),
        comet.totalBorrow(),
        comet.baseTokenPriceFeed(),
      ]);
    baseIndexScale = +baseIndexScale;

    const compPriceFeedAddress = compoundMarket.priceFeeds.COMP;

    const compPriceInUsd =
      +(await comet.getPrice(compPriceFeedAddress)).toString() /
      priceFeedMantissa;
    const usdcPriceInUsd =
      +(await comet.getPrice(baseTokenPriceFeed)).toString() /
      priceFeedMantissa;

    const usdcTotalSupply = +totalSupply.toString() / usdcMantissa;
    const usdcTotalBorrow = +totalBorrow.toString() / usdcMantissa;
    const baseTrackingSupplySpeed = +(
      await comet.callStatic.baseTrackingSupplySpeed()
    ).toString();
    const baseTrackingBorrowSpeed = +(
      await comet.callStatic.baseTrackingBorrowSpeed()
    ).toString();

    const compToSuppliersPerDay =
      (baseTrackingSupplySpeed / baseIndexScale) * secondsPerDay;
    const compToBorrowersPerDay =
      (baseTrackingBorrowSpeed / baseIndexScale) * secondsPerDay;

    const supplyCompRewardApr =
      ((compPriceInUsd * compToSuppliersPerDay) /
        (usdcTotalSupply * usdcPriceInUsd)) *
      daysInYear *
      100;
    const borrowCompRewardApr =
      ((compPriceInUsd * compToBorrowersPerDay) /
        (usdcTotalBorrow * usdcPriceInUsd)) *
      daysInYear *
      100;

    return { supplyCompRewardApr, borrowCompRewardApr };
  } catch (error) {
    console.log("compReward apr ", error);
    return {};
  }
}

function normalizeValue(value: number, minValue: number, maxValue: number) {
  if (minValue === maxValue) {
    console.log("Min and Max values cannot be the same.");
    return 0;
  }

  const normalizedValue = (value - minValue) / (maxValue - minValue);
  return normalizedValue;
}

export const getLiquidationRisk = (
  collaterals: any[],
  borrowed: string,
): number => {
  if (collaterals.length === 0) {
    return 0;
  }

  const collateralUsdValues = collaterals.map((collateral: any) => {
    return (
      (collateral?.asset?.supplied *
        collateral?.asset?.price *
        Number(formatUnits(collateral?.borrowCollateralFactor, 16))) /
      100
    );
  });
  const totalBororwCapacity = collateralUsdValues.reduce(
    (sum, curr) => sum + curr,
    0,
  );

  if (!totalBororwCapacity || totalBororwCapacity <= 0) {
    return 0;
  }

  const liquidationRiskPercent = Number(borrowed) / totalBororwCapacity;

  return normalizeValue(liquidationRiskPercent, 0, 1);
};
