import Image from "next/image";
import Link from "next/link";
import { FormattedNumber } from "src/components/primitives/FormattedNumber";

export default function StakeCard(props) {
  return (
    <div className="grid gap-12 p-4 ">
      <div className="flex items-center gap-4">
        <picture className="logo max-w-[50px]">
          <Image
            src={`/logos/${props.chain}.png`}
            height={50}
            width={50}
            alt="logo"
          />
        </picture>
        <h2 className="attention-voice">Stake {props.chain}</h2>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="teaser-voice">Staking APR</h3>
          <p className="text-secondary">
            <FormattedNumber value="6.7" percent />
          </p>
        </div>
        <div>
          <h3 className="teaser-voice">Max slashing</h3>
          <p className="text-secondary">
            <FormattedNumber value="30" percent />
          </p>
        </div>

        <div>
          <h3 className="teaser-voice">Wallet Balance</h3>
          <p className="text-secondary">
            <FormattedNumber value="0.00" />
          </p>
        </div>
      </div>
      <button className="button">Stake</button>

      <div className="grid gap-6 md:grid-cols-2 ">
        <div className="grid gap-6 rounded-[--corners] bg-black p-6">
          <h3 className="teaser-voice text-center">Staked {props.chain}</h3>
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
          <h3 className="teaser-voice text-center">Claimable {props.chain}</h3>
          <p className="firm-voice text-center text-primary">
            <FormattedNumber value="0.00" symbol="USD" />
          </p>
          <p className="whsiper-voice text-center">
            <FormattedNumber value="0.00" symbol="USD" />
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="button whisper-voice outline">Claim</button>
            <button className="button whisper-voice outline">Restake</button>
          </div>
          <div className="flex flex-wrap justify-between">
            <p className="whisper-voice">{props.chain} per month</p>
            <p className="whisper-voice">
              <strong>0</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
