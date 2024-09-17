import { API_ETH_MOCK_ADDRESS, PERMISSION } from "contract-helpers";
import React, { useMemo } from "react";
import {
  ComputedReserveData,
  ComputedUserReserveData,
  useAppDataContext,
} from "src/hooks/app-data-provider/useAppDataProvider";
import { useWalletBalances } from "src/hooks/app-data-provider/useWalletBalances";
import { AssetCapsProvider } from "src/hooks/useAssetCaps";
import { useIsWrongNetwork } from "src/hooks/useIsWrongNetwork";
import { useModalContext } from "src/hooks/useModal";
import { useProtocolDataContext } from "src/hooks/useProtocolDataContext";
import {
  getNetworkConfig,
  isFeatureEnabled,
} from "src/utils/marketsAndNetworksConfig";
import { GENERAL } from "src/utils/mixPanelEvents";

import { TxModalTitle } from "../FlowCommons/TxModalTitle";
import { ChangeNetworkWarning } from "../Warnings/ChangeNetworkWarning";
import { TxErrorView } from "./Error";
import { populateChainConfigs } from "configuration";

export interface ModalWrapperProps {
  underlyingAsset: string;
  poolReserve: ComputedReserveData;
  userReserve: ComputedUserReserveData;
  symbol: string;
  tokenBalance: string;
  nativeBalance: string;
  isWrongNetwork: boolean;
  action?: string;
  modalTitle?: string;
}

export const ModalWrapper: React.FC<{
  underlyingAsset: string;
  title: React.ReactElement;
  requiredChainId?: number;
  // if true wETH will stay wETH otherwise wETH will be returned as ETH
  keepWrappedSymbol?: boolean;
  hideTitleSymbol?: boolean;
  requiredPermission?: PERMISSION;
  children: (props: ModalWrapperProps) => React.ReactNode;
  action?: string;
}> = ({
  hideTitleSymbol,
  underlyingAsset,
  children,
  requiredChainId: _requiredChainId,
  title,
  requiredPermission,
  keepWrappedSymbol,
  action,
}) => {
  // const { readOnlyModeAddress } = useWeb3Context();
  const { walletBalances } = useWalletBalances();
  const { currentNetworkConfig, currentMarketData } = useProtocolDataContext();
  const { user, reserves, compoundState } = useAppDataContext();
  const { txError, mainTxState } = useModalContext();
  // const { permissions } = usePermissions();

  const { isWrongNetwork, requiredChainId } =
    useIsWrongNetwork(_requiredChainId);

  if (txError && txError.blocking) {
    return <TxErrorView txError={txError} />;
  }

  if (
    requiredPermission &&
    isFeatureEnabled.permissions(currentMarketData) &&
    // !permissions.includes(requiredPermission) &&
    currentMarketData.permissionComponent
  ) {
    return <>{currentMarketData.permissionComponent}</>;
  }

  const poolReserve = reserves.find((reserve) => {
    if (underlyingAsset.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase())
      return reserve?.isWrappedBaseAsset;
    return underlyingAsset === reserve.underlyingAsset;
  }) as ComputedReserveData;

  const userReserve = user?.userReservesData.find((userReserve) => {
    if (underlyingAsset.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase())
      return userReserve?.reserve?.isWrappedBaseAsset;
    return underlyingAsset === userReserve.underlyingAsset;
  }) as ComputedUserReserveData;

  const symbol =
    poolReserve?.isWrappedBaseAsset && !keepWrappedSymbol
      ? currentNetworkConfig?.baseAssetSymbol
      : poolReserve?.symbol;

  // find current compound asset
  const compoundAsset = useMemo(() => {
    if (!compoundState?.assets) {
      return {};
    }

    if (compoundState?.assetInfo?.baseInfo?.address === underlyingAsset) {
      return compoundState?.assetInfo?.baseInfo;
    }

    const asset = compoundState?.assets?.find(
      (asset: any) => asset?.asset?.address === underlyingAsset,
    )?.asset;
    return asset;
  }, [compoundState, underlyingAsset]);

  // console.log("state test ", { compoundAsset, compoundState });

  const defaultPoolReserveForCompound = {
    id: "421614-0xf1d212998a793a39433096fc08cf9334f179d01b-0x07e8be3643a4cabf17a06ba28057dac550be4dab",
    underlyingAsset: underlyingAsset,
    name: compoundAsset?.name,
    symbol: compoundAsset?.symbol,
    decimals: compoundAsset?.decimals,
    baseLTVasCollateral: "8000",
    reserveLiquidationThreshold: "8500",
    reserveLiquidationBonus: "10500",
    reserveFactor: "0.1",
    usageAsCollateralEnabled: true,
    borrowingEnabled: true,
    stableBorrowRateEnabled: true,
    isActive: true,
    isFrozen: false,
    liquidityIndex: "1000000000000000000000000000",
    variableBorrowIndex: "1000000000000000000000000000",
    liquidityRate: "17284764748749671948544000",
    variableBorrowRate: "29215896864000000000000000",
    stableBorrowRate: "53607948432000000000000000",
    lastUpdateTimestamp: 1718306742,
    aTokenAddress: "0xc328fCf217EfD80c3e2E1851a23353EB537c33CD",
    stableDebtTokenAddress: "0x83444096c60cB7867A9c82C3Bb95863155b700CB",
    variableDebtTokenAddress: "0x24524BD612703C9aF3fD84dfaE74260EC872d76a",
    interestRateStrategyAddress: "0x1be59DB1c24150F5c572BF242D03A93cFC96e342",
    availableLiquidity: "34264232056000",
    totalPrincipalStableDebt: "0",
    averageStableRate: "0",
    stableDebtLastUpdateTimestamp: 0,
    totalScaledVariableDebt: "65735767.944",
    priceInMarketReferenceCurrency: "100000000",
    priceOracle: "0x131aF991cC484dA6D7De31fCDeDDd2B837DD6024",
    variableRateSlope1: "40000000000000000000000000",
    variableRateSlope2: "600000000000000000000000000",
    stableRateSlope1: "20000000000000000000000000",
    stableRateSlope2: "600000000000000000000000000",
    baseStableBorrowRate: "39000000000000000000000000",
    baseVariableBorrowRate: "0",
    optimalUsageRatio: "900000000000000000000000000",
    isPaused: false,
    debtCeiling: "0",
    eModeCategoryId: 0,
    borrowCap: "0",
    supplyCap: "0",
    eModeLtv: 0,
    eModeLiquidationThreshold: 0,
    eModeLiquidationBonus: 0,
    eModePriceSource: "0x0000000000000000000000000000000000000000",
    eModeLabel: "",
    borrowableInIsolation: false,
    accruedToTreasury: "0",
    unbacked: "0",
    isolationModeTotalDebt: "0",
    debtCeilingDecimals: 0,
    isSiloedBorrowing: false,
    flashLoanEnabled: true,
    totalDebt: "66060458.268511",
    totalStableDebt: "0",
    totalVariableDebt: "66060458.268511",
    totalLiquidity: "100324690.324511",
    borrowUsageRatio: "0.65846660532747565369",
    supplyUsageRatio: "0.65846660532747565369",
    formattedReserveLiquidationBonus: "0.05",
    formattedEModeLiquidationBonus: "-1",
    formattedEModeLiquidationThreshold: "0",
    formattedEModeLtv: "0",
    supplyAPY: "0.01743501069713646706",
    variableBorrowAPY: "0.0296468679960842044",
    stableBorrowAPY: "0.05507087881946310206",
    formattedAvailableLiquidity: "34264232.056",
    unborrowedLiquidity: "34264232.056",
    formattedBaseLTVasCollateral: "0.8",
    supplyAPR: "0.01728476474874967195",
    variableBorrowAPR: "0.029215896864",
    stableBorrowAPR: "0.053607948432",
    formattedReserveLiquidationThreshold: "0.85",
    debtCeilingUSD: "0",
    isolationModeTotalDebtUSD: "0",
    availableDebtCeilingUSD: "0",
    isIsolated: false,
    totalLiquidityUSD: "100324690.324511",
    availableLiquidityUSD: "34264232.056",
    totalDebtUSD: "66060458.268511",
    totalVariableDebtUSD: "66060458.268511",
    totalStableDebtUSD: "0",
    formattedPriceInMarketReferenceCurrency: "1",
    priceInUSD: "1",
    borrowCapUSD: "0",
    supplyCapUSD: "0",
    unbackedUSD: "0",
    aIncentivesData: [],
    vIncentivesData: [],
    sIncentivesData: [],
    iconSymbol: "USDC",
    isEmodeEnabled: false,
    isWrappedBaseAsset: false,
  };

  const compoundMarket = populateChainConfigs();
  const isCompound = compoundMarket.currentMarket === "compound";

  const _poolReserve: any = useMemo(() => {
    return isCompound ? defaultPoolReserveForCompound : poolReserve;
  }, [poolReserve, defaultPoolReserveForCompound, isCompound]);

  const compoundBalances = useMemo(() => {
    if (!compoundState?.assets || !compoundState?.assetInfo?.baseInfo) {
      return {};
    }

    const balances: any = {};
    compoundState?.assets?.forEach((asset: any) => {
      balances[asset?.asset?.address?.toLowerCase()] =
        asset?.asset?.formatBalance;
    });
    balances[compoundState?.assetInfo?.baseInfo?.address?.toLowerCase()] =
      compoundState?.assetInfo?.baseInfo?.formatBalance;

    return balances;
  }, [compoundState]);

  console.log("compoundBalances", {
    compoundBalances,
    compoundState,
    balance: compoundBalances?.[_poolReserve?.underlyingAsset],
  });

  return (
    <AssetCapsProvider asset={_poolReserve}>
      {!mainTxState.success && (
        <TxModalTitle
          title={title}
          symbol={hideTitleSymbol ? undefined : symbol}
        />
      )}
      {isWrongNetwork && (
        <ChangeNetworkWarning
          networkName={getNetworkConfig(requiredChainId).name}
          chainId={requiredChainId}
          event={{
            eventName: GENERAL.SWITCH_NETWORK,
            eventParams: {
              asset: underlyingAsset,
            },
          }}
        />
      )}
      {children({
        isWrongNetwork,
        nativeBalance: isCompound
          ? "0"
          : walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()]?.amount || "0",
        tokenBalance: isCompound
          ? compoundBalances?.[_poolReserve?.underlyingAsset?.toLowerCase()]
          : walletBalances?.[_poolReserve?.underlyingAsset?.toLowerCase()]
              ?.amount || "0",
        poolReserve: _poolReserve,
        symbol,
        underlyingAsset,
        userReserve,
      })}
    </AssetCapsProvider>
  );
};
