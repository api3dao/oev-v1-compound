import { ChainId, PERMISSION } from "contract-helpers";
// import { Trans } from '@lingui/macro';
import React, { useMemo } from "react";
import {
  ModalContextType,
  ModalType,
  useModalContext,
} from "src/hooks/useModal";

import { BasicModal } from "../../primitives/BasicModal";
import { ModalWrapper } from "../FlowCommons/ModalWrapper";
import { SupplyModalContent } from "./SupplyModalContent";
import { useChainId } from "wagmi";
import { useAppDataContext } from "src/hooks/app-data-provider/useAppDataProvider";
import { populateChainConfigs, populateCompoundMarket } from "configuration";

export const SupplyModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
  }>;

  const chainId = useChainId();
  const { compoundState } = useAppDataContext();

  const isBaseBorrowed = useMemo(() => {
    if (!compoundState?.assetInfo?.baseInfo?.borrowedInBase) {
      return false;
    }

    return compoundState?.assetInfo?.baseInfo?.borrowedInBase > 0
      ? true
      : false;
  }, [compoundState]);

  const compoundMarket = populateCompoundMarket();
  const chainConfig = populateChainConfigs();
  const isCompound = chainConfig.currentMarket === "compound" ? true : false;

  const supplyModalTitle = isCompound
    ? args.underlyingAsset === compoundMarket.marketAsset
      ? isBaseBorrowed
        ? "Repay"
        : "Supply"
      : "Supply"
    : "Supply";

  return (
    <BasicModal open={type === ModalType.Supply} setOpen={close}>
      <ModalWrapper
        action="supply"
        title={<span>{supplyModalTitle}</span>}
        underlyingAsset={args.underlyingAsset}
        requiredChainId={chainId}
        requiredPermission={PERMISSION.DEPOSITOR}
      >
        {(params) => (
          <SupplyModalContent {...params} modalTitle={supplyModalTitle} />
        )}
      </ModalWrapper>
    </BasicModal>
  );
};
