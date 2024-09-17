import { useEffect } from "react";
import {
  Address,
  useAccount,
  useChainId,
  useSwitchNetwork,
  useWalletClient,
} from "wagmi";
import { useRootStore } from "src/store/root";
import { useEthersProvider, useEthersSigner } from "./ethers";
import { watchAsset } from "viem/actions";

export const useWeb3 = () => {
  const [setAccount] = useRootStore((store) => [store.setAccount]);
  const currentAccount = useAccount();
  const chain = useChainId();
  const { error: switchNetworkError, switchNetwork } = useSwitchNetwork();
  const signer = useEthersSigner();
  const provider = useEthersProvider();
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    if (currentAccount.address) {
      setAccount(currentAccount.address);
    }
  }, [currentAccount.address, setAccount]);

  const addTokenToMetamask = async (token: {
    address: string;
    decimals: number;
    symbol: string;
    logo: string;
  }) => {
    const image = "";
    if (!token?.address || !token?.symbol || !walletClient) return;
    try {
      const success = await watchAsset(walletClient, {
        type: "ERC20",
        options: {
          address: token?.address as Address,
          symbol: token?.symbol,
          image: token?.logo,
          decimals: token?.decimals,
        },
      });

      console.log({ success });

      if (success) {
        localStorage.setItem(token.address, "watching");
      }

      return success;
    } catch (error) {
      console.log("error adding token to watch ", error);
      return false;
    }
  };

  return {
    account: currentAccount.address,
    ...currentAccount,
    chainId: chain,
    switchNetworkError,
    switchNetwork: switchNetwork,
    addTokenToMetamask: addTokenToMetamask,
    signer,
    provider,
  };
};
