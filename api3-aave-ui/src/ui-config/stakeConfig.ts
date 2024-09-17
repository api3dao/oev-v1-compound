import { ChainId, Stake } from "contract-helpers";

export interface StakeConfig {
  chainId: ChainId;
  stakeDataProvider: string;
  tokens: {
    [token: string]: {
      TOKEN_STAKING: string;
      STAKING_REWARD_TOKEN: string;
      STAKING_HELPER?: string;
    };
  };
}

// todo add latest deployment addresses for staking
export const stakeConfig: StakeConfig = {
  chainId: ChainId.mumbai,
  stakeDataProvider: "0x5E045cfb738F01bC73CEAFF783F4C16e8B14090b",
  tokens: {
    [Stake.aave]: {
      TOKEN_STAKING: "0xF50D357BB1CC675A5F6463Bf80f174Cbc1AD1857", // stake contract
      STAKING_REWARD_TOKEN: "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
      STAKING_HELPER: "0xce0424653fb2fd48ed1b621bdbd60db16b2e388a",
    },
    // [Stake.bpt]: {
    //   TOKEN_STAKING: "0xa1116930326D21fB917d5A27F1E9943A9595fb47",
    //   STAKING_REWARD_TOKEN: "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
    // },
  },
};
