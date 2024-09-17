import { valueToBigNumber } from "@aave/math-utils";
import {
  GeneralStakeUIDataHumanized,
  GetUserStakeUIDataHumanized,
} from "contract-helpers/dist/esm/uiStakeDataProvider-contract/types";
import { BigNumber } from "ethers";
import { formatEther, formatUnits } from "ethers/lib/utils";
import Image from "next/image";
import { FormattedNumber } from "src/components/primitives/FormattedNumber";
import { useCurrentTimestamp } from "src/hooks/useCurrentTimestamp";

export interface StakingPanelProps {
  onStakeAction?: () => void;
  onStakeRewardClaimAction?: () => void;
  onStakeRewardClaimRestakeAction?: () => void;
  onCooldownAction?: () => void;
  onUnstakeAction?: () => void;
  stakeData?: GeneralStakeUIDataHumanized["aave"];
  stakeUserData?: GetUserStakeUIDataHumanized["aave"];
  description?: React.ReactNode;
  headerAction?: React.ReactNode;
  ethPriceUsd?: string;
  stakeTitle: string;
  stakedToken: string;
  maxSlash: string;
  icon: string;
  hasDiscountProgram?: boolean;
}

export default function StakeCard({
  onStakeAction,
  onStakeRewardClaimAction,
  onStakeRewardClaimRestakeAction,
  onCooldownAction,
  onUnstakeAction,
  stakeTitle,
  stakedToken,
  description,
  headerAction,
  icon,
  stakeData,
  stakeUserData,
  ethPriceUsd,
  maxSlash,
  hasDiscountProgram,
}: StakingPanelProps) {
  const now = useCurrentTimestamp(1);

  // Cooldown logic
  const stakeCooldownSeconds = stakeData?.stakeCooldownSeconds || 0;
  const userCooldown = stakeUserData?.userCooldownTimestamp || 0;
  const stakeUnstakeWindow = stakeData?.stakeUnstakeWindow || 0;

  const userCooldownDelta = now - userCooldown;
  const isCooldownActive =
    userCooldownDelta < stakeCooldownSeconds + stakeUnstakeWindow;
  const isUnstakeWindowActive =
    isCooldownActive &&
    userCooldownDelta > stakeCooldownSeconds &&
    userCooldownDelta < stakeUnstakeWindow + stakeCooldownSeconds;

  // Others
  const availableToStake = formatEther(
    BigNumber.from(stakeUserData?.underlyingTokenUserBalance || "0"),
  );

  const availableToReactivateCooldown =
    isCooldownActive &&
    BigNumber.from(stakeUserData?.stakeTokenRedeemableAmount || 0).gt(
      stakeUserData?.userCooldownAmount || 0,
    );

  const stakedUSD = formatUnits(
    BigNumber.from(stakeUserData?.stakeTokenRedeemableAmount || "0")
      .mul(stakeData?.stakeTokenPriceEth || "0")
      .mul(ethPriceUsd || "1"),
    18 + 18 + 8, // userBalance (18), stakedTokenPriceEth (18), ethPriceUsd (8)
  );

  const claimableUSD = formatUnits(
    BigNumber.from(stakeUserData?.userIncentivesToClaim || "0")
      .mul(stakeData?.rewardTokenPriceEth || "0")
      .mul(ethPriceUsd || "1"),
    18 + 18 + 8, // incentivesBalance (18), rewardTokenPriceEth (18), ethPriceUsd (8)
  );

  const aavePerMonth = formatEther(
    valueToBigNumber(stakeUserData?.stakeTokenRedeemableAmount || "0")
      .dividedBy(stakeData?.stakeTokenTotalSupply || "1")
      .multipliedBy(stakeData?.distributionPerSecond || "0")
      .multipliedBy("2592000")
      .toFixed(0),
  );

  return (
    <div className="grid gap-12 p-4 ">
      <div className="flex items-center gap-4">
        <picture className="logo max-w-[50px]">
          <Image src={`/logos/PZM.svg`} height={50} width={50} alt="logo" />
        </picture>
        <h2 className="attention-voice">Stake PZM</h2>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="teaser-voice">Staking APR</h3>
          <p className="text-secondary">
            <FormattedNumber
              value={parseFloat(stakeData?.stakeApy || "0") / 10000}
              percent
              variant="secondary14"
            />
          </p>
        </div>
        <div>
          <h3 className="teaser-voice">Max slashing</h3>
          <p className="text-secondary">
            <FormattedNumber value={maxSlash} percent variant="secondary14" />
          </p>
        </div>

        <div>
          <h3 className="teaser-voice">Wallet Balance</h3>
          <p className="text-secondary">
            <FormattedNumber value={availableToStake.toString()} />
          </p>
        </div>
      </div>
      {/**Stake action */}

      <button className="button max-w-xs" onClick={onStakeAction}>
        Stake
      </button>

      <div className="grid gap-6 md:grid-cols-2 ">
        <div className="grid gap-6 rounded-[--corners] bg-black p-6">
          <h3 className="teaser-voice text-center">Staked PZM</h3>

          <p className="firm-voice text-center text-primary">
            <FormattedNumber value="0.00" symbol="USD" />
          </p>

          <p className="whsiper-voice text-center">
            <FormattedNumber value="0.00" symbol="USD" />
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            <button disabled className="button whisper-voice outline">
              Cooldown to unstake
            </button>
          </div>

          <div className="flex flex-wrap justify-between">
            <p className="whisper-voice">Cooldown period</p>
            <p className="whisper-voice">
              <strong>20d</strong>
            </p>
          </div>
        </div>
        <div className="grid gap-4 rounded-[--corners]  bg-black p-6">
          <h3 className="teaser-voice text-center">Claimable PZM</h3>

          <p className="firm-voice text-center text-primary">
            <FormattedNumber value="0.00" symbol="USD" />
          </p>

          <p className="whsiper-voice text-center">
            <FormattedNumber value="0.00" symbol="USD" />
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={onStakeRewardClaimAction}
              disabled={stakeUserData?.userIncentivesToClaim === "0"}
              className="button whisper-voice outline"
            >
              Claim
            </button>
            <button
              onClick={onStakeRewardClaimRestakeAction}
              disabled={stakeUserData?.userIncentivesToClaim === "0"}
              className="button whisper-voice outline"
            >
              Restake
            </button>
          </div>

          <div className="flex flex-wrap justify-between">
            <p className="whisper-voice">PZM per month</p>
            <p className="whisper-voice">
              <strong>0</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
