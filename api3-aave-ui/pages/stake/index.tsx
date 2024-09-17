import { useWeb3Context } from "src/hooks/lib/hooks/useWeb3Context";
import StakeCard from "../../components/stake/StakeCard";
import StakeHeader from "../../components/stake/StakeHeader";
import { useUserStakeUiData } from "src/hooks/stake/useUserStakeUiData";
import { useGeneralStakeUiData } from "src/hooks/stake/useGeneralStakeUiData";
import { useModalContext } from "src/hooks/useModal";
import { formatEther, formatUnits } from "ethers/lib/utils";
import { BigNumber } from "ethers";

export default function Stake() {
  const { currentAccount, loading, chainId } = useWeb3Context();

  const { data: stakeUserResult, isLoading: stakeUserResultLoading } =
    useUserStakeUiData();
  const { data: stakeGeneralResult, isLoading: stakeGeneralResultLoading } =
    useGeneralStakeUiData();

  const stakeDataLoading = stakeUserResultLoading || stakeGeneralResultLoading;

  const {
    openStake,
    openStakeCooldown,
    openUnstake,
    openStakeRewardsClaim,
    openStakeRewardsRestakeClaim,
  } = useModalContext();

  // Total funds at Safety Module (stkaave tvl + stkbpt tvl)
  const tvl = formatUnits(
    BigNumber.from(stakeGeneralResult?.aave.stakeTokenTotalSupply || "0")
      .mul(stakeGeneralResult?.aave.stakeTokenPriceEth || "0")
      .add(
        BigNumber.from(
          stakeGeneralResult?.bpt.stakeTokenTotalSupply || "0",
        ).mul(stakeGeneralResult?.bpt.stakeTokenPriceEth || "0"),
      )
      .mul(stakeGeneralResult?.ethPriceUsd || 1),
    18 + 18 + 8, // 2x total supply (18 decimals), 1x ethPriceUSD (8 decimals)
  );

  // Total AAVE Emissions (stkaave dps + stkbpt dps)
  const stkEmission = formatEther(
    BigNumber.from(stakeGeneralResult?.aave.distributionPerSecond || "0")
      .add(stakeGeneralResult?.bpt.distributionPerSecond || "0")
      .mul("86400"),
  );

  return (
    <section>
      <StakeHeader
        tvl={tvl}
        stkEmission={stkEmission}
        loading={stakeDataLoading}
      />
      <div className="inner-column wide grid gap-4">
        <StakeCard
          stakeTitle="Stake PZM"
          stakedToken="PZM"
          maxSlash="0.3"
          icon="aave"
          stakeData={stakeGeneralResult?.aave}
          stakeUserData={stakeUserResult?.aave}
          ethPriceUsd={stakeGeneralResult?.ethPriceUsd}
          onStakeAction={() => openStake("aave", "PZM")} // assetName, icon
          onCooldownAction={() => openStakeCooldown("aave")}
          onUnstakeAction={() => openUnstake("aave", "PZM")}
          onStakeRewardClaimAction={() => openStakeRewardsClaim("aave", "PZM")}
          onStakeRewardClaimRestakeAction={() =>
            openStakeRewardsRestakeClaim("aave", "PZM")
          }
          // headerAction={<BuyWithFiat cryptoSymbol="AAVE" networkMarketName={network} />}
          hasDiscountProgram={false}
        />
      </div>
    </section>
  );
}
