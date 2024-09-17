"use client";
import React from "react";
import { configureChains, createConfig, WagmiConfig } from "wagmi";

import { publicProvider } from "wagmi/providers/public";

//RainbowKit
import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { populateChainConfigs } from "configuration";

const populateWagmiChains = () => {
  const config: any = populateChainConfigs();

  console.log("rpc ", config.rpc);
  const chainConfig: any = {
    /** ID in number form */
    id: config.chainId,
    /** Human-readable name */
    name: config.name,
    /** Internal network name */
    // network: "auroratest",
    /** Currency used by chain */
    nativeCurrency: config.nativeCurrency,
    /** Collection of RPC endpoints */
    rpcUrls: {
      default: {
        http: config.rpc,
      },
      public: {
        http: config.rpc,
      },
      alchemy: { http: "" },
      infura: { http: "" },
    },
    testnet: true,
  };

  return [chainConfig];
};

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [...populateWagmiChains()],
  [publicProvider()],
);
const { connectors } = getDefaultWallets({
  appName: "Phantazm Frontend",
  projectId: "ca73069c03a2858722ff0941f1dea908",
  chains,
});
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

const WagmiProvider = ({ children }: any) => {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        chains={chains}
        theme={darkTheme({
          accentColor: "#87B7E2",
          accentColorForeground: "black",
          borderRadius: "small",
          overlayBlur: "large",
        })}
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default WagmiProvider;
