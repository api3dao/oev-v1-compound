import { InterestRate } from "contract-helpers";
import {
  Box,
  Button,
  Grid,
  SvgIcon,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useModalContext } from "src/hooks/useModal";
import { useProtocolDataContext } from "src/hooks/useProtocolDataContext";
import { useRootStore } from "src/store/root";
import { CustomMarket } from "src/ui-config/marketsConfig";
import { getMaxGhoMintAmount } from "src/utils/getMaxAmountAvailableToBorrow";
import { weightedAverageAPY } from "src/utils/ghoUtilities";

import {
  ComputedReserveData,
  ComputedUserReserveData,
  useAppDataContext,
} from "../../../hooks/app-data-provider/useAppDataProvider";
import Image from "next/image";
import { FormattedNumber } from "src/components/primitives/FormattedNumber";

export const GhoBorrowedPositionsListItem = ({
  reserve,
  borrowRateMode,
}: ComputedUserReserveData & { borrowRateMode: InterestRate }) => {
  const { openBorrow, openRepay } = useModalContext();
  const { currentMarket } = useProtocolDataContext();
  const { ghoLoadingData, ghoReserveData, ghoUserData, user } =
    useAppDataContext();
  const { ghoUserDataFetched, ghoUserQualifiesForDiscount } = useRootStore();
  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down("xsm"));

  const discountableAmount =
    ghoUserData.userGhoBorrowBalance >=
    ghoReserveData.ghoMinDebtTokenBalanceForDiscount
      ? ghoUserData.userGhoAvailableToBorrowAtDiscount
      : 0;
  const borrowRateAfterDiscount = weightedAverageAPY(
    ghoReserveData.ghoVariableBorrowAPY,
    ghoUserData.userGhoBorrowBalance,
    discountableAmount,
    ghoReserveData.ghoBorrowAPYWithMaxDiscount,
  );

  const hasDiscount = ghoUserQualifiesForDiscount();

  const { isActive, isFrozen, borrowingEnabled } = reserve;
  const maxAmountUserCanMint = Number(getMaxGhoMintAmount(user));
  const availableBorrows = Math.min(
    maxAmountUserCanMint,
    ghoReserveData.aaveFacilitatorRemainingCapacity,
  );

  const props: GhoBorrowedPositionsListItemProps = {
    reserve,
    borrowRateMode,
    userGhoBorrowBalance: ghoUserData.userGhoBorrowBalance,
    hasDiscount,
    ghoLoadingData,
    ghoUserDataFetched,
    borrowRateAfterDiscount,
    currentMarket,
    userDiscountTokenBalance: ghoUserData.userDiscountTokenBalance,
    borrowDisabled:
      !isActive ||
      !borrowingEnabled ||
      isFrozen ||
      availableBorrows <= 0 ||
      ghoReserveData.aaveFacilitatorRemainingCapacity < 0.000001,
    onRepayClick: () =>
      openRepay(
        reserve.underlyingAsset,
        borrowRateMode,
        isFrozen,
        currentMarket,
        reserve.name,
        "dashboard",
      ),
    onBorrowClick: () =>
      openBorrow(
        reserve.underlyingAsset,
        currentMarket,
        reserve.name,
        "dashboard",
      ),
  };

  if (downToXSM) {
    return <GhoBorrowedPositionsListItemMobile {...props} />;
  } else {
    return <GhoBorrowedPositionsListItemDesktop {...props} />;
  }
};

interface GhoBorrowedPositionsListItemProps {
  reserve: ComputedReserveData;
  borrowRateMode: InterestRate;
  userGhoBorrowBalance: number;
  hasDiscount: boolean;
  ghoLoadingData: boolean;
  ghoUserDataFetched: boolean;
  borrowRateAfterDiscount: number;
  currentMarket: CustomMarket;
  userDiscountTokenBalance: number;
  borrowDisabled: boolean;
  onRepayClick: () => void;
  onBorrowClick: () => void;
}

const GhoBorrowedPositionsListItemDesktop = ({
  reserve,
  borrowRateMode,
  userGhoBorrowBalance,
  hasDiscount,
  ghoLoadingData,
  ghoUserDataFetched,
  borrowRateAfterDiscount,
  currentMarket,
  userDiscountTokenBalance,
  borrowDisabled,
  onRepayClick,
  onBorrowClick,
}: GhoBorrowedPositionsListItemProps) => {
  const { symbol, iconSymbol, name, isActive, isFrozen, underlyingAsset } =
    reserve;

  return (
    <div className="list-item">
      <Grid item md={2} sm={2} xs={2}>
        <div className="flex items-center gap-2">
          <picture className="w-[40px] max-w-[30px]">
            <Image
              src={`/logos/${reserve?.symbol}.png`}
              width={40}
              height={40}
              alt={reserve?.symbol}
            />
          </picture>
          <p className="whisper-voice">{reserve?.name}</p>
        </div>
      </Grid>

      <Grid item md={2} sm={2} xs={2}>
        <p>
          <FormattedNumber data-cy={`apy`} value={"0"} />
        </p>
      </Grid>

      <Grid item md={2} sm={2} xs={2}>
        <p>
          <FormattedNumber data-cy={`apy`} percent value={"0"} />
        </p>
      </Grid>

      <Grid item md={2} sm={2} xs={2}>
        <p className="whisper-voice"> {}</p>
      </Grid>
      <Grid item md={2} sm={2} xs={2}>
        <div className="flex w-full sm:w-fit">
          <button
            // disabled={disableSupply}
            onClick={() => {
              // openBorrow(
              //   reserve.underlyingAsset,
              //   currentMarket,
              //   name,
              //   "dashboard",
              // );
            }}
            className="button whisper-voice"
          >
            Borrow
          </button>

          <button
            // disabled={disableSupply}
            onClick={() => {
              // openRepay(
              //   reserve.underlyingAsset,
              //   borrowRateMode,
              //   isFrozen,
              //   currentMarket,
              //   name,
              //   "dashboard",
              // );
            }}
            className="button whisper-voice"
          >
            Repay
          </button>
        </div>
      </Grid>
    </div>
  );
};

const GhoBorrowedPositionsListItemMobile = ({
  reserve,
  userGhoBorrowBalance,
  hasDiscount,
  ghoLoadingData,
  borrowRateAfterDiscount,
  currentMarket,
  userDiscountTokenBalance,
  borrowDisabled,
  onRepayClick,
  onBorrowClick,
}: GhoBorrowedPositionsListItemProps) => {
  const { symbol, iconSymbol, name, isActive } = reserve;

  return (
    <div className="list-item">
      <Grid item md={2} sm={2} xs={2}>
        <div className="flex items-center gap-2">
          <picture className="w-[40px] max-w-[30px]">
            <Image
              src={`/logos/${reserve?.symbol}.png`}
              width={40}
              height={40}
              alt={reserve?.symbol}
            />
          </picture>
          <p className="whisper-voice">{reserve?.name}</p>
        </div>
      </Grid>

      <Grid item md={2} sm={2} xs={2}>
        <p>
          <FormattedNumber data-cy={`apy`} value={"0"} />
        </p>
      </Grid>

      <Grid item md={2} sm={2} xs={2}>
        <p>
          <FormattedNumber data-cy={`apy`} percent value={"0"} />
        </p>
      </Grid>

      <Grid item md={2} sm={2} xs={2}>
        <p className="whisper-voice"> {}</p>
      </Grid>
      <Grid item md={2} sm={2} xs={2}>
        <div className="flex w-full sm:w-fit">
          <button
            // disabled={disableSupply}
            onClick={() => {
              // openBorrow(
              //   reserve.underlyingAsset,
              //   currentMarket,
              //   name,
              //   "dashboard",
              // );
            }}
            className="button whisper-voice"
          >
            Borrow
          </button>

          <button
            // disabled={disableSupply}
            onClick={() => {
              // openRepay(
              //   reserve.underlyingAsset,
              //   borrowRateMode,
              //   isFrozen,
              //   currentMarket,
              //   name,
              //   "dashboard",
              // );
            }}
            className="button whisper-voice"
          >
            Repay
          </button>
        </div>
      </Grid>
    </div>
  );
};
