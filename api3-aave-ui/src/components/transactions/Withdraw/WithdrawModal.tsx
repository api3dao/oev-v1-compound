import { ChainId, PERMISSION } from "contract-helpers";
import React, { useState } from "react";
import {
  ModalContextType,
  ModalType,
  useModalContext,
} from "src/hooks/useModal";

import { BasicModal } from "../../primitives/BasicModal";
import { ModalWrapper } from "../FlowCommons/ModalWrapper";
import { WithdrawModalContent } from "./WithdrawModalContent";
import { useChainId } from "wagmi";

export const WithdrawModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
  }>;
  const [withdrawUnWrapped, setWithdrawUnWrapped] = useState(true);
  const chainId = useChainId();

  return (
    <BasicModal open={type === ModalType.Withdraw} setOpen={close}>
      <ModalWrapper
        title={<span>Withdraw</span>}
        underlyingAsset={args.underlyingAsset}
        keepWrappedSymbol={!withdrawUnWrapped}
        requiredPermission={PERMISSION.DEPOSITOR}
        requiredChainId={chainId}
      >
        {(params) => (
          <WithdrawModalContent
            {...params}
            unwrap={withdrawUnWrapped}
            setUnwrap={setWithdrawUnWrapped}
          />
        )}
      </ModalWrapper>
    </BasicModal>
  );
};
