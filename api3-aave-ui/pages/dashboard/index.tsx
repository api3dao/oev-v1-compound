import React from "react";

import { useAppDataContext } from "src/hooks/app-data-provider/useAppDataProvider";
import { FormattedNumber } from "src/components/primitives/FormattedNumber";

import {
  normalize,
  UserIncentiveData,
  valueToBigNumber,
} from "@aave/math-utils";
import { useProtocolDataContext } from "src/hooks/useProtocolDataContext";
import { ChainId } from "contract-helpers";
import { useAccount } from "wagmi";
import { NoData } from "src/components/primitives/NoData";
import { BorrowAssetsList } from "src/components/dashboard/BorrowAssetsList/BorrowAssetsList";
import { SupplyAssetsList } from "src/components/dashboard/SupplyAssetsList/SupplyAssetsList";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { HealthFactorNumber } from "src/components/HealthFactorNumber";
import { useModalContext } from "src/hooks/useModal";
import { SuppliedPositionsList } from "src/components/dashboard/SuppliedPositionsList /SuppliedPositionsList";
import { BorrowedPositionsList } from "src/components/dashboard/BorrowedPositionsList/BorrowedPositionsList";

export default function Dashboard() {
  const { user, reserves, loading } = useAppDataContext();
  const { currentNetworkConfig, currentMarketData, currentMarket } =
    useProtocolDataContext();
  const currentAccount = useAccount();

  const { openClaimRewards } = useModalContext();

  const { claimableRewardsUsd } = Object.keys(
    user.calculatedUserIncentives,
  ).reduce(
    (acc, rewardTokenAddress) => {
      const incentive: UserIncentiveData =
        user.calculatedUserIncentives[rewardTokenAddress];
      const rewardBalance = normalize(
        incentive.claimableRewards,
        incentive.rewardTokenDecimals,
      );

      let tokenPrice = 0;
      // getting price from reserves for the native rewards for v2 markets
      if (!currentMarketData.v3 && Number(rewardBalance) > 0) {
        if (currentMarketData.chainId === ChainId.mainnet) {
          const aave = reserves.find((reserve) => reserve.symbol === "AAVE");
          tokenPrice = aave ? Number(aave.priceInUSD) : 0;
        } else {
          reserves.forEach((reserve) => {
            if (
              reserve.symbol === currentNetworkConfig.wrappedBaseAssetSymbol
            ) {
              tokenPrice = Number(reserve.priceInUSD);
            }
          });
        }
      } else {
        tokenPrice = Number(incentive.rewardPriceFeed);
      }

      const rewardBalanceUsd = Number(rewardBalance) * tokenPrice;

      if (rewardBalanceUsd > 0) {
        if (acc.assets.indexOf(incentive.rewardTokenSymbol) === -1) {
          acc.assets.push(incentive.rewardTokenSymbol);
        }

        acc.claimableRewardsUsd += Number(rewardBalanceUsd);
      }

      return acc;
    },
    { claimableRewardsUsd: 0, assets: [] } as {
      claimableRewardsUsd: number;
      assets: string[];
    },
  );

  const loanToValue =
    user?.totalCollateralMarketReferenceCurrency === "0"
      ? "0"
      : valueToBigNumber(user?.totalBorrowsMarketReferenceCurrency || "0")
          .dividedBy(user?.totalCollateralMarketReferenceCurrency || "1")
          .toFixed();

  const theme = useTheme();
  const downToSM = useMediaQuery(theme.breakpoints.down("sm"));
  const valueTypographyVariant = downToSM ? "main16" : "main21";
  const noDataTypographyVariant = downToSM ? "secondary16" : "secondary21";

  return (
    <>
      <section>
        <div className="inner-column">
          <div className="dashboard-card grid gap-3 ">
            <h1 className="loud-voice gradient-text justify-self-center text-center">
              My Assets
            </h1>

            <div className="summary-cards">
              <div className="summary-card">
                <h3 className="teaser-voice">Net worth</h3>
                <p className="attention-voice">
                  {currentAccount ? (
                    <FormattedNumber
                      value={Number(user?.netWorthUSD || 0)}
                      symbol="USD"
                      visibleDecimals={2}
                    />
                  ) : (
                    <NoData
                      variant={noDataTypographyVariant}
                      sx={{ opacity: "0.7" }}
                    />
                  )}
                </p>
              </div>

              <div className="summary-card">
                <h3 className="teaser-voice">Net APY</h3>
                <p className="attention-voice">
                  {currentAccount && Number(user?.netWorthUSD) > 0 ? (
                    <FormattedNumber
                      value={user.netAPY}
                      visibleDecimals={2}
                      percent
                    />
                  ) : (
                    <NoData
                      variant={noDataTypographyVariant}
                      sx={{ opacity: "0.7" }}
                    />
                  )}
                </p>
              </div>

              <div className="summary-card">
                <h3 className="teaser-voice">Health factor</h3>
                <p className="attention-voice">
                  {currentAccount && user?.healthFactor !== "-1" && (
                    <HealthFactorNumber
                      value={user?.healthFactor || "-1"}
                      variant={valueTypographyVariant}
                    />
                  )}
                </p>
              </div>
              <div className="summary-card">
                <h3 className="teaser-voice">Available rewards</h3>
                <p className="attention-voice"> </p>

                {currentAccount && claimableRewardsUsd > 0 ? (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: { xs: "flex-start", xsm: "center" },
                      flexDirection: { xs: "column", xsm: "row" },
                    }}
                  >
                    <Box
                      sx={{ display: "inline-flex", alignItems: "center" }}
                      data-cy={"Claim_Box"}
                    >
                      <FormattedNumber
                        value={claimableRewardsUsd}
                        visibleDecimals={2}
                        symbol="USD"
                        data-cy={"Claim_Value"}
                      />
                    </Box>

                    <button onClick={() => openClaimRewards()}>Claim</button>
                  </Box>
                ) : (
                  <NoData
                    variant={noDataTypographyVariant}
                    sx={{ opacity: "0.7" }}
                  />
                )}
              </div>
            </div>

            <p className="whisper-voice">
              * lending-borrowing market is highly risky, DYOR before investing.
            </p>
          </div>
        </div>
      </section>
      <section>
        <div className="inner-column wide  grid gap-6 lg:grid-cols-2">
          <div className="grid items-start gap-6">
            <div>
              <SuppliedPositionsList />
            </div>
            <div>
              <SupplyAssetsList />
            </div>
          </div>
          <div className="grid items-start gap-6">
            <div className="">
              <BorrowedPositionsList />
            </div>

            <div>
              <BorrowAssetsList />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
