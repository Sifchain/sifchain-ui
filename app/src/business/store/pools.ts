import { reactive } from "vue";

import { LiquidityProvider, Pool } from "@sifchain/sdk";

export type PoolStore = {
  [s: string]: Pool;
};

export type AccountPool = {
  lp: LiquidityProvider;
  pool: string;
};

export type AccountPoolStore = {
  [address: string]: {
    [pool: string]: AccountPool;
  };
};

export const pools = reactive<PoolStore>({}) as PoolStore;
export const accountpools = reactive<AccountPoolStore>({}) as AccountPoolStore;
