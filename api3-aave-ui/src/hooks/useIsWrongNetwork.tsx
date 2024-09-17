// import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { useWeb3Context } from "./lib/hooks/useWeb3Context";
import { useWeb3 } from "./lib/useWeb3";
import { useProtocolDataContext } from "./useProtocolDataContext";

export function useIsWrongNetwork(_requiredChainId?: number) {
  const { currentChainId } = useProtocolDataContext();
  const { chainId } = useWeb3();

  const requiredChainId = _requiredChainId ? _requiredChainId : currentChainId;
  const isWrongNetwork = chainId !== requiredChainId;

  return {
    isWrongNetwork,
    requiredChainId,
  };
}
