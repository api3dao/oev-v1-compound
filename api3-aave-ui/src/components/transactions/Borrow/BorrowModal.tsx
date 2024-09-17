import { PERMISSION } from "contract-helpers";

import React, { useMemo, useState } from "react";
import {
  ModalContextType,
  ModalType,
  useModalContext,
} from "src/hooks/useModal";
import { useProtocolDataContext } from "src/hooks/useProtocolDataContext";
import { useRootStore } from "src/store/root";

import { BasicModal } from "../../primitives/BasicModal";
import { ModalWrapper } from "../FlowCommons/ModalWrapper";
import { BorrowModalContent } from "./BorrowModalContent";
import { GhoBorrowModalContent } from "./GhoBorrowModalContent";
import { useChainId } from "wagmi";
import { populateChainConfigs, populateCompoundMarket } from "configuration";
import { useAppDataContext } from "src/hooks/app-data-provider/useAppDataProvider";

export const BorrowModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
    name?: string;
  }>;
  const { currentMarket } = useProtocolDataContext();
  const chainId = useChainId();
  const { compoundState } = useAppDataContext();

  const [borrowUnWrapped, setBorrowUnWrapped] = useState(true);
  const [displayGho] = useRootStore((store) => [store.displayGho]);

  const handleBorrowUnwrapped = (borrowUnWrapped: boolean) => {
    setBorrowUnWrapped(borrowUnWrapped);
  };
  const chainConfig = populateChainConfigs();
  const compoundMarket = populateCompoundMarket();
  const isCompound = chainConfig.currentMarket === "compound" ? true : false;

  const isBaseSupplied = useMemo(() => {
    if (!compoundState?.assetInfo?.baseInfo?.suppliedFormatted) {
      return false;
    }

    return compoundState?.assetInfo?.baseInfo?.suppliedFormatted > 0.0001
      ? true
      : false;
  }, [compoundState]);

  const modalTitle = isCompound
    ? args.underlyingAsset === compoundMarket.marketAsset
      ? isBaseSupplied
        ? "Withdraw"
        : "Borrow"
      : "Withdraw"
    : "Borrow";
  return (
    <BasicModal open={type === ModalType.Borrow} setOpen={close}>
      <ModalWrapper
        action="borrow"
        title={<span>{modalTitle}</span>}
        underlyingAsset={args.underlyingAsset}
        keepWrappedSymbol={!borrowUnWrapped}
        requiredChainId={chainId}
        requiredPermission={PERMISSION.BORROWER}
      >
        {(params) =>
          displayGho({ symbol: params.symbol, currentMarket }) ? (
            <GhoBorrowModalContent {...params} />
          ) : (
            <BorrowModalContent
              {...params}
              unwrap={borrowUnWrapped}
              setUnwrap={handleBorrowUnwrapped}
            />
          )
        }
      </ModalWrapper>
    </BasicModal>
  );
};
