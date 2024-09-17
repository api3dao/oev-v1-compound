import React from "react";
import {
  ModalContextType,
  ModalType,
  useModalContext,
} from "src/hooks/useModal";

import { BasicModal } from "../../primitives/BasicModal";
import { ModalWrapper } from "../FlowCommons/ModalWrapper";
import { CollateralChangeModalContent } from "./CollateralChangeModalContent";
import { ChainId } from "contract-helpers";
import { useChainId } from "wagmi";

export const CollateralChangeModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
  }>;

  const chainId = useChainId();

  return (
    <BasicModal open={type === ModalType.CollateralChange} setOpen={close}>
      <ModalWrapper
        title={<div>Review tx</div>}
        underlyingAsset={args.underlyingAsset}
        requiredChainId={chainId}
      >
        {(params) => <CollateralChangeModalContent {...params} />}
      </ModalWrapper>
    </BasicModal>
  );
};
