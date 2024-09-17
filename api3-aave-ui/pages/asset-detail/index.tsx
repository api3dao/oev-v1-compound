import { useRouter } from "next/router";
import { ReactNode, useState } from "react";
import {
  ComputedReserveData,
  useAppDataContext,
} from "src/hooks/app-data-provider/useAppDataProvider";
import Image from "next/image";
import Link from "next/link";
import { FormattedNumber } from "src/components/primitives/FormattedNumber";
import ExternalLinkIcon from "components/ExternalLinkIcon";
import { useWalletBalances } from "src/hooks/app-data-provider/useWalletBalances";
import { useRootStore } from "src/store/root";
import { useProtocolDataContext } from "src/hooks/useProtocolDataContext";
import {
  getMaxAmountAvailableToBorrow,
  getMaxGhoMintAmount,
} from "src/utils/getMaxAmountAvailableToBorrow";
import { valueToBigNumber } from "@aave/math-utils";
import BigNumber from "bignumber.js";
import { API_ETH_MOCK_ADDRESS, InterestRate } from "contract-helpers";
import { getMaxAmountAvailableToSupply } from "src/utils/getMaxAmountAvailableToSupply";
import { amountToUsd } from "src/utils/utils";
import { Box, Stack, useTheme } from "@mui/material";
import { AvailableTooltip } from "src/components/infoTooltips/AvailableTooltip";
import { CapType } from "src/components/caps/helper";
import { GENERAL } from "src/utils/mixPanelEvents";
import { WalletIcon } from "src/components/icons/WalletIcon";
import { useModalContext } from "src/hooks/useModal";
import { useWeb3Context } from "src/hooks/lib/hooks/useWeb3Context";
import { populateAssetIcon } from "configuration";
import SymbolIcon from "src/components/SymbolIcon";

interface ValueWithSymbolProps {
  value: string;
  symbol: string;
  children?: ReactNode;
}

const ValueWithSymbol = ({ value, symbol, children }: ValueWithSymbolProps) => {
  return (
    <Stack direction="row" alignItems="center" gap={1}>
      <FormattedNumber value={value} variant="h4" color="text.primary" />
      <p color="text.secondary"> {symbol}</p>
      {children}
    </Stack>
  );
};

interface WalletBalanceProps {
  balance: string;
  symbol: string;
  marketTitle: string;
}
const WalletBalance = ({
  balance,
  symbol,
  marketTitle,
}: WalletBalanceProps) => {
  const theme = useTheme();

  return (
    <Stack direction="row" gap={1}>
      <Box
        sx={(theme) => ({
          width: "42px",
          height: "42px",
          background: theme.palette.background.surface,
          border: `0.5px solid ${theme.palette.background.disabled}`,
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        })}
      >
        <WalletIcon sx={{ stroke: `${theme.palette.text.secondary}` }} />
      </Box>
      <Box>
        <p className="teaser-voice text-primary">Wallet balance</p>
        <p className="solid-voice">
          <ValueWithSymbol value={balance} symbol={symbol}>
            {/* <Box sx={{ ml: 2 }}>
            <BuyWithFiat cryptoSymbol={symbol} networkMarketName={marketTitle} />
          </Box> */}
          </ValueWithSymbol>
        </p>
      </Box>
    </Stack>
  );
};

interface ActionProps {
  value: string;
  usdValue: string;
  symbol: string;
  disable: boolean;
  onActionClicked: () => void;
  reserve: ComputedReserveData;
}

const SupplyAction = ({
  reserve,
  value,
  usdValue,
  symbol,
  disable,
  onActionClicked,
}: ActionProps) => {
  return (
    <Stack>
      <AvailableTooltip
        variant="description"
        text={<p className="teaser-voice text-primary">Available to supply</p>}
        capType={CapType.supplyCap}
        event={{
          eventName: GENERAL.TOOL_TIP,
          eventParams: {
            tooltip: "Available to supply: your info",
            asset: reserve?.underlyingAsset,
            assetName: reserve?.name,
          },
        }}
      />
      <Stack
        sx={{ height: "44px" }}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box>
          <p className="solid-voice">
            <ValueWithSymbol value={value} symbol={symbol} />
          </p>
        </Box>
        <button
          onClick={onActionClicked}
          disabled={disable}
          data-cy="supplybutton"
          className="button whisper-voice"
        >
          Supply
        </button>
      </Stack>
    </Stack>
  );
};

const BorrowAction = ({
  reserve,
  value,
  usdValue,
  symbol,
  disable,
  onActionClicked,
}: ActionProps) => {
  return (
    <Stack>
      <AvailableTooltip
        variant="description"
        text={<p className="teaser-voice text-primary">Available to borrow</p>}
        capType={CapType.borrowCap}
        event={{
          eventName: GENERAL.TOOL_TIP,
          eventParams: {
            tooltip: "Available to borrow: your info",
            asset: reserve.underlyingAsset,
            assetName: reserve.name,
          },
        }}
      />
      <Stack
        sx={{ height: "44px" }}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box>
          <p className="solid-voice">
            <ValueWithSymbol value={value} symbol={symbol} />
          </p>
        </Box>
        <button
          onClick={onActionClicked}
          disabled={disable}
          data-cy="borrowButton"
          className="button whisper-voice"
        >
          Borrow
        </button>
      </Stack>
    </Stack>
  );
};

export default function AssetDetail() {
  const router = useRouter();
  const {
    ghoReserveData,
    user,
    loading: loadingReserves,
    marketReferencePriceInUsd,
    reserves,
    loading,
    eModes,
  } = useAppDataContext();

  const { currentAccount, loading: loadingWeb3Context } = useWeb3Context();

  const underlyingAsset = router.query.underlyingAsset as string;

  const reserve = reserves.find(
    (reserve) => reserve.underlyingAsset === underlyingAsset,
  ) as ComputedReserveData;

  // user info data

  const [selectedAsset, setSelectedAsset] = useState<string>(reserve?.symbol);

  const { currentMarket, currentNetworkConfig } = useProtocolDataContext();
  const { walletBalances, loading: loadingWalletBalance } = useWalletBalances();

  const [minRemainingBaseTokenBalance, displayGho] = useRootStore((store) => [
    store.poolComputed.minRemainingBaseTokenBalance,
    store.displayGho,
  ]);
  const { baseAssetSymbol } = currentNetworkConfig;
  let balance = walletBalances?.[reserve?.underlyingAsset];

  let maxAmountToBorrow = "0";
  let maxAmountToSupply = "0";
  const isGho = displayGho({ symbol: reserve?.symbol, currentMarket });

  if (isGho && reserve) {
    const maxMintAmount = getMaxGhoMintAmount(user);
    maxAmountToBorrow = BigNumber.min(
      maxMintAmount,
      valueToBigNumber(ghoReserveData.aaveFacilitatorRemainingCapacity),
    ).toString();
    maxAmountToSupply = "0";
  } else {
    maxAmountToBorrow = getMaxAmountAvailableToBorrow(
      reserve,
      user,
      InterestRate.Variable,
    ).toString();

    maxAmountToSupply = getMaxAmountAvailableToSupply(
      balance?.amount || "0",
      reserve,
      reserve?.underlyingAsset,
      minRemainingBaseTokenBalance,
    ).toString();
  }

  const maxAmountToBorrowUsd = amountToUsd(
    maxAmountToBorrow,
    reserve?.formattedPriceInMarketReferenceCurrency,
    marketReferencePriceInUsd,
  ).toString();

  const maxAmountToSupplyUsd = amountToUsd(
    maxAmountToSupply,
    reserve?.formattedPriceInMarketReferenceCurrency,
    marketReferencePriceInUsd,
  ).toString();

  // const { disableSupplyButton, disableBorrowButton, alerts } = useReserveActionState({
  //   balance: balance?.amount || '0',
  //   maxAmountToSupply: maxAmountToSupply.toString(),
  //   maxAmountToBorrow: maxAmountToBorrow.toString(),
  //   reserve,
  // });

  // if (!currentAccount && !isPermissionsLoading) {
  //   return <ConnectWallet loading={loadingWeb3Context} />;
  // }

  // if (loadingReserves || loadingWalletBalance) {
  //   return <ActionsSkeleton />;
  // }

  const { openSupply, openBorrow } = useModalContext();

  const onSupplyClicked = () => {
    if (reserve?.isWrappedBaseAsset && selectedAsset === baseAssetSymbol) {
      openSupply(
        API_ETH_MOCK_ADDRESS.toLowerCase(),
        currentMarket,
        reserve?.name,
        "reserve",
        true,
      );
    } else {
      openSupply(
        reserve.underlyingAsset,
        currentMarket,
        reserve?.name,
        "reserve",
        true,
      );
    }
  };

  // const { market } = getMarketInfoById(currentMarket);

  return (
    <>
      <section>
        <div className="inner-column  grid gap-4">
          <div className="flex items-center gap-4 justify-self-center">
            <SymbolIcon symbol={reserve?.symbol} />

            <div className="flex flex-col">
              <p className="solid-voice">{reserve?.symbol}</p>
              <h1 className="loud-voice">{reserve?.name}</h1>
            </div>
            <Link
              target="_bank"
              href={currentNetworkConfig.explorerLinkBuilder({
                address: reserve?.underlyingAsset,
              })}
            >
              <ExternalLinkIcon />
            </Link>
          </div>

          <div className="summary-cards">
            <div className="summary-card">
              <h3 className="teaser-voice">Reserve Size</h3>
              <p className="attention-voice">
                <FormattedNumber
                  value={Number(reserve?.availableLiquidityUSD)}
                  symbol="USD"
                />
              </p>
            </div>

            <div className="summary-card">
              <h3 className="teaser-voice">Available liquidity</h3>
              <p className="attention-voice">
                <FormattedNumber
                  value={Number(reserve?.availableLiquidity)}
                  symbol="USD"
                />
              </p>
            </div>

            <div className="summary-card">
              <h3 className="teaser-voice">Utilization Rate</h3>
              <p className="attention-voice">
                <FormattedNumber value={reserve?.borrowUsageRatio} percent />
              </p>
            </div>

            <div className="summary-card">
              <h3 className="teaser-voice">Oracle price</h3>
              <p className="attention-voice">
                <FormattedNumber value={reserve?.priceInUSD} symbol="USD" />
              </p>
            </div>
          </div>
        </div>
      </section>
      <section>
        <div className="inner-column wide grid items-start gap-6 md:grid-cols-3">
          <div className="your-info   grid gap-3 self-start rounded border  p-6">
            {!currentAccount ? (
              <></>
            ) : (
              <>
                <WalletBalance
                  balance={balance?.amount}
                  symbol={reserve?.symbol}
                  marketTitle={currentMarket}
                />
                {reserve?.isFrozen || reserve?.isPaused ? (
                  <Box sx={{ mt: 3 }}>
                    {reserve?.isPaused ? (
                      <p>Reserve is Paused</p>
                    ) : (
                      <p> Reserve is Frozen</p>
                    )}
                  </Box>
                ) : (
                  <>
                    <Stack gap={3}>
                      {!isGho && (
                        <SupplyAction
                          reserve={reserve}
                          value={maxAmountToSupply.toString()}
                          usdValue={maxAmountToSupplyUsd}
                          symbol={reserve?.symbol}
                          disable={false}
                          onActionClicked={onSupplyClicked}
                        />
                      )}
                      {reserve?.borrowingEnabled && (
                        <BorrowAction
                          reserve={reserve}
                          value={maxAmountToBorrow.toString()}
                          usdValue={maxAmountToBorrowUsd}
                          symbol={reserve?.symbol}
                          disable={false}
                          onActionClicked={() => {
                            openBorrow(
                              reserve.underlyingAsset,
                              currentMarket,
                              reserve.name,
                              "reserve",
                              true,
                            );
                          }}
                        />
                      )}
                      {/* {alerts} */}
                    </Stack>
                  </>
                )}
              </>
            )}
          </div>
          <div className="supply-info  ">
            <h2 className="attention-voice">Supply Info</h2>
            <div className="content-wrapper grid gap-6 ">
              <div className="flex gap-6">
                <div>
                  <h3 className="teaser-voice">
                    Total Supplied /
                    <strong className="whisper-voice text-primary"> $</strong>
                  </h3>
                  <p className="firm-voice text-primary">
                    <FormattedNumber value={Number(reserve?.totalLiquidity)} />
                  </p>
                  <p className="solid-voice text-secondary">
                    <FormattedNumber
                      value={Number(reserve?.totalLiquidityUSD)}
                    />
                  </p>
                </div>
                <div>
                  <h3 className="teaser-voice">
                    APY /
                    <strong className="whisper-voice text-primary"> %</strong>
                  </h3>
                  <p className="firm-voice text-primary">
                    <FormattedNumber
                      value={Number(reserve?.supplyAPY)}
                      symbolsColor="#A5A8B6"
                    />
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="borrow-info  ">
            <h2 className="attention-voice">Borrow Info</h2>
            <div className="content-wrapper  gap-6 ">
              <div className="flex flex-wrap gap-6">
                <div>
                  <h3 className="teaser-voice">
                    Total Borrowed /
                    <strong className="whisper-voice text-primary"> $</strong>
                  </h3>
                  <p className="firm-voice text-primary">
                    <FormattedNumber value={Number(reserve?.totalDebt)} />
                  </p>
                  <p className="solid-voice text-secondary">
                    <FormattedNumber value={Number(reserve?.totalDebtUSD)} />
                  </p>
                </div>
                <div>
                  <h3 className="teaser-voice">
                    APY, variable /
                    <strong className="whisper-voice text-primary"> ±%</strong>
                  </h3>
                  <p className="firm-voice text-primary">
                    <FormattedNumber
                      value={Number(reserve?.variableBorrowAPY)}
                      symbolsColor="#A5A8B6"
                    />
                  </p>
                </div>
                <div>
                  <h3 className="teaser-voice">
                    APY, stable /
                    <strong className="whisper-voice text-primary"> %</strong>
                  </h3>
                  <p className="firm-voice text-primary">
                    <FormattedNumber
                      value={Number(reserve?.stableBorrowAPY)}
                      symbolsColor="#A5A8B6"
                    />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
