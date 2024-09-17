// @ts-nocheck
"use client";
import "../styles/site.css";
import "@rainbow-me/rainbowkit/styles.css";
import type { AppProps } from "next/app";
import Head from "next/head";

import { BackgroundDataProvider } from "src/hooks/app-data-provider/BackgroundDataProvider";
import { AppDataProvider } from "src/hooks/app-data-provider/useAppDataProvider";
import { SharedDependenciesProvider } from "src/ui-config/SharedDependenciesProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ModalContextProvider } from "src/hooks/useModal";
import { SupplyModal } from "src/components/transactions/Supply/SupplyModal";
import { EmodeModal } from "src/components/transactions/Emode/EmodeModal";
import { GasStationProvider } from "src/components/transactions/GasStation/GasStationProvider";
import { Web3ContextProvider } from "src/hooks/lib/Web3Provider";
import WagmiProvider from "src/hooks/lib/WagmiProvider";
import { BorrowModal } from "src/components/transactions/Borrow/BorrowModal";
import { RepayModal } from "src/components/transactions/Repay/RepayModal";
import Layout from "components/Layout";
import { StakeModal } from "src/components/transactions/Stake/StakeModal";
import { StakeCooldownModal } from "src/components/transactions/StakeCooldown/StakeCooldownModal";
import { UnStakeModal } from "src/components/transactions/UnStake/UnStakeModal";
import { StakeRewardClaimModal } from "src/components/transactions/StakeRewardClaim/StakeRewardClaimModal";
import { StakeRewardClaimRestakeModal } from "src/components/transactions/StakeRewardClaimRestake/StakeRewardClaimRestakeModal";
import { WithdrawModal } from "src/components/transactions/Withdraw/WithdrawModal";
import { CollateralChangeModal } from "src/components/transactions/CollateralChange/CollateralChangeModal";
import { ClaimRewardsModal } from "src/components/transactions/ClaimRewards/ClaimRewardsModal";

export const queryClient = new QueryClient();
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider>
      <Head>
        <title>API3 dAPI demo</title>
        <meta content="API3 Aave-v2" name="description" />

        {/* TODO: Fix the favicon */}
        <link href="images/favicon.png" rel="icon" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        ></link>
      </Head>

      <QueryClientProvider client={queryClient}>
        <Web3ContextProvider>
          <ModalContextProvider>
            <BackgroundDataProvider>
              <AppDataProvider>
                <GasStationProvider>
                  <SharedDependenciesProvider>
                    <Layout>
                      <Component {...pageProps} />
                    </Layout>
                    <SupplyModal />
                    <EmodeModal />
                    <BorrowModal />
                    <RepayModal />
                    <WithdrawModal />
                    <CollateralChangeModal />
                    <ClaimRewardsModal />

                    <StakeModal />
                    <StakeCooldownModal />
                    <UnStakeModal />
                    <StakeRewardClaimModal />
                    <StakeRewardClaimRestakeModal />
                  </SharedDependenciesProvider>
                </GasStationProvider>
              </AppDataProvider>
            </BackgroundDataProvider>
          </ModalContextProvider>
        </Web3ContextProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default MyApp;
