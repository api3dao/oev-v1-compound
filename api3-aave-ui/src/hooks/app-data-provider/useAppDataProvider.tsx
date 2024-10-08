// @ts-nocheck
import { ReserveDataHumanized } from "contract-helpers";
import {
  ComputedUserReserve,
  formatGhoReserveData,
  formatGhoUserData,
  formatReservesAndIncentives,
  FormattedGhoReserveData,
  FormattedGhoUserData,
  FormatUserSummaryAndIncentivesResponse,
  formatUserSummaryWithDiscount,
  USD_DECIMALS,
  UserReserveData,
} from "@aave/math-utils";
import BigNumber from "bignumber.js";
import { formatUnits } from "ethers/lib/utils";
import React, { useContext } from "react";
import { EmodeCategory } from "src/helpers/types";
import { useRootStore } from "src/store/root";
import {
  GHO_SUPPORTED_MARKETS,
  weightedAverageAPY,
} from "src/utils/ghoUtilities";

import {
  reserveSortFn,
  selectCurrentBaseCurrencyData,
  selectCurrentReserves,
  selectCurrentUserEmodeCategoryId,
  selectCurrentUserReserves,
  selectEmodes,
  selectFormattedReserves,
  selectUserSummaryAndIncentives,
} from "../../store/poolSelectors";
import { useCurrentTimestamp } from "../useCurrentTimestamp";
import { useProtocolDataContext } from "../useProtocolDataContext";
import { useAccount } from "wagmi";
import { useWeb3 } from "../lib/useWeb3";
import { populateChainConfigs } from "configuration";

/**
 * removes the marketPrefix from a symbol
 * @param symbol
 * @param prefix
 */
export const unPrefixSymbol = (symbol: string, prefix: string) => {
  return symbol
    .toUpperCase()
    .replace(RegExp(`^(${prefix[0]}?${prefix.slice(1)})`), "");
};

export type ComputedReserveData = ReturnType<
  typeof formatReservesAndIncentives
>[0] &
  ReserveDataHumanized & {
    iconSymbol: string;
    isEmodeEnabled: boolean;
    isWrappedBaseAsset: boolean;
  };

export type ComputedUserReserveData = ComputedUserReserve<ComputedReserveData>;

export type ExtendedFormattedUser =
  FormatUserSummaryAndIncentivesResponse<ComputedReserveData> & {
    earnedAPY: number;
    debtAPY: number;
    netAPY: number;
    isInEmode: boolean;
    userEmodeCategoryId: number;
  };

export interface AppDataContextType {
  loading: boolean;
  reserves: ComputedReserveData[];
  eModes: Record<number, EmodeCategory>;
  refreshPoolData?: () => Promise<void[]>;
  isUserHasDeposits: boolean;
  user: ExtendedFormattedUser;
  // refreshIncentives?: () => Promise<void>;
  loading: boolean;

  marketReferencePriceInUsd: string;
  marketReferenceCurrencyDecimals: number;
  userReserves: UserReserveData[];
  ghoReserveData: FormattedGhoReserveData;
  ghoUserData: FormattedGhoUserData;
  ghoLoadingData: boolean;
  compoundState: any;
  marketType: string;
}

const AppDataContext = React.createContext<AppDataContextType>(
  {} as AppDataContextType,
);

/**
 * This is the only provider you'll ever need.
 * It fetches reserves /incentives & walletbalances & keeps them updated.
 */

export const AppDataProvider: React.FC = ({ children }) => {
  const currentTimestamp = useCurrentTimestamp(5);
  const { address: currentAccount } = useWeb3();
  const { currentMarket } = useProtocolDataContext();
  const [
    reserves,
    baseCurrencyData,
    userReserves,
    userEmodeCategoryId,
    eModes,
    ghoReserveData,
    ghoUserData,
    ghoReserveDataFetched,
    formattedPoolReserves,
    userSummary,
    displayGho,
    compoundState,
  ] = useRootStore((state) => [
    selectCurrentReserves(state),
    selectCurrentBaseCurrencyData(state),
    selectCurrentUserReserves(state),
    selectCurrentUserEmodeCategoryId(state),
    selectEmodes(state),
    state.ghoReserveData,
    state.ghoUserData,
    state.ghoReserveDataFetched,
    selectFormattedReserves(state, currentTimestamp),
    selectUserSummaryAndIncentives(state, currentTimestamp),
    state.displayGho,
    { assets: state.compoundV3Assets, assetInfo: state.assetInfo },
  ]);

  const formattedGhoReserveData: FormattedGhoReserveData = formatGhoReserveData(
    {
      ghoReserveData,
    },
  );
  const formattedGhoUserData: FormattedGhoUserData = formatGhoUserData({
    ghoReserveData,
    ghoUserData,
    currentTimestamp,
  });

  let user = userSummary;
  // Factor discounted GHO interest into cumulative user fields
  if (
    GHO_SUPPORTED_MARKETS.includes(currentMarket) &&
    formattedGhoUserData.userDiscountedGhoInterest > 0
  ) {
    const userSummaryWithDiscount = formatUserSummaryWithDiscount({
      userGhoDiscountedInterest: formattedGhoUserData.userDiscountedGhoInterest,
      user,
      marketReferenceCurrencyPriceUSD: Number(
        formatUnits(
          baseCurrencyData.marketReferenceCurrencyPriceInUsd,
          USD_DECIMALS,
        ),
      ),
    });
    user = {
      ...user,
      ...userSummaryWithDiscount,
    };
  }

  const proportions = user.userReservesData.reduce(
    (acc, value) => {
      const reserve = formattedPoolReserves.find(
        (r) => r.underlyingAsset === value.reserve.underlyingAsset,
      );

      if (reserve) {
        if (value.underlyingBalanceUSD !== "0") {
          acc.positiveProportion = acc.positiveProportion.plus(
            new BigNumber(reserve.supplyAPY).multipliedBy(
              value.underlyingBalanceUSD,
            ),
          );
          if (reserve.aIncentivesData) {
            reserve.aIncentivesData.forEach((incentive) => {
              acc.positiveProportion = acc.positiveProportion.plus(
                new BigNumber(incentive.incentiveAPR).multipliedBy(
                  value.underlyingBalanceUSD,
                ),
              );
            });
          }
        }
        if (value.variableBorrowsUSD !== "0") {
          // TODO: Export to unified helper function
          if (
            displayGho({ symbol: reserve.symbol, currentMarket: currentMarket })
          ) {
            const borrowRateAfterDiscount = weightedAverageAPY(
              formattedGhoReserveData.ghoVariableBorrowAPY,
              formattedGhoUserData.userGhoBorrowBalance,
              formattedGhoUserData.userGhoAvailableToBorrowAtDiscount,
              formattedGhoReserveData.ghoBorrowAPYWithMaxDiscount,
            );
            acc.negativeProportion = acc.negativeProportion.plus(
              new BigNumber(borrowRateAfterDiscount).multipliedBy(
                formattedGhoUserData.userGhoBorrowBalance,
              ),
            );
            if (reserve.vIncentivesData) {
              reserve.vIncentivesData.forEach((incentive) => {
                acc.positiveProportion = acc.positiveProportion.plus(
                  new BigNumber(incentive.incentiveAPR).multipliedBy(
                    formattedGhoUserData.userGhoBorrowBalance,
                  ),
                );
              });
            }
          } else {
            acc.negativeProportion = acc.negativeProportion.plus(
              new BigNumber(reserve.variableBorrowAPY).multipliedBy(
                value.variableBorrowsUSD,
              ),
            );
            if (reserve.vIncentivesData) {
              reserve.vIncentivesData.forEach((incentive) => {
                acc.positiveProportion = acc.positiveProportion.plus(
                  new BigNumber(incentive.incentiveAPR).multipliedBy(
                    value.variableBorrowsUSD,
                  ),
                );
              });
            }
          }
        }
        if (value.stableBorrowsUSD !== "0") {
          acc.negativeProportion = acc.negativeProportion.plus(
            new BigNumber(value.stableBorrowAPY).multipliedBy(
              value.stableBorrowsUSD,
            ),
          );
          if (reserve.sIncentivesData) {
            reserve.sIncentivesData.forEach((incentive) => {
              acc.positiveProportion = acc.positiveProportion.plus(
                new BigNumber(incentive.incentiveAPR).multipliedBy(
                  value.stableBorrowsUSD,
                ),
              );
            });
          }
        }
      } else {
        throw new Error("no possible to calculate net apy");
      }

      return acc;
    },
    {
      positiveProportion: new BigNumber(0),
      negativeProportion: new BigNumber(0),
    },
  );

  const isUserHasDeposits = user.userReservesData.some(
    (userReserve) => userReserve.scaledATokenBalance !== "0",
  );

  const currentChainConfig = populateChainConfigs();
  const marketType = currentChainConfig.currrentMarket || "aave";

  const earnedAPY = proportions.positiveProportion
    .dividedBy(user.totalLiquidityUSD)
    .toNumber();
  const debtAPY = proportions.negativeProportion
    .dividedBy(user.totalBorrowsUSD)
    .toNumber();
  const netAPY =
    (earnedAPY || 0) *
      (Number(user.totalLiquidityUSD) /
        Number(user.netWorthUSD !== "0" ? user.netWorthUSD : "1")) -
    (debtAPY || 0) *
      (Number(user.totalBorrowsUSD) /
        Number(user.netWorthUSD !== "0" ? user.netWorthUSD : "1"));

  return (
    <AppDataContext.Provider
      value={{
        loading: !reserves.length || (!!currentAccount && !userReserves.length),
        reserves: formattedPoolReserves,
        eModes,
        user: {
          ...user,
          totalBorrowsUSD: user.totalBorrowsUSD,
          totalBorrowsMarketReferenceCurrency:
            user.totalBorrowsMarketReferenceCurrency,
          userEmodeCategoryId,
          isInEmode: userEmodeCategoryId !== 0,
          userReservesData: user.userReservesData.sort((a, b) =>
            reserveSortFn(a.reserve, b.reserve),
          ),
          earnedAPY,
          debtAPY,
          netAPY,
        },
        userReserves,
        isUserHasDeposits,
        marketReferencePriceInUsd:
          baseCurrencyData.marketReferenceCurrencyPriceInUsd,
        marketReferenceCurrencyDecimals:
          baseCurrencyData.marketReferenceCurrencyDecimals,
        // TODO: we should consider removing this from the context and use zustand instead. If we had a selector that would return the formatted gho data, I think that
        // would work out pretty well. We could even extend that pattern for the other reserves, and migrate towards the global store instead of the app data provider.
        // ghoLoadingData for now is just propagated through to reduce changes to other components.
        ghoReserveData: {
          ...formattedGhoReserveData,
          aaveFacilitatorRemainingCapacity: Math.max(
            formattedGhoReserveData.aaveFacilitatorRemainingCapacity - 0.000001,
            0,
          ),
        },
        ghoUserData: formattedGhoUserData,
        ghoLoadingData: !ghoReserveDataFetched,
        compoundState: compoundState,
        marketType,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppDataContext = () => useContext(AppDataContext);
