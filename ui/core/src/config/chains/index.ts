import { NetworkEnv } from "../getEnv";
import { NetEnvChainsLookup } from "./NetEnvChainsLookup";
import DEVNET_CHAINS from "./chains.devnet";

export const netEnvChainsLookup: NetEnvChainsLookup = {
  [NetworkEnv.LOCALNET]: DEVNET_CHAINS,
  [NetworkEnv.TESTNET]: DEVNET_CHAINS,
  [NetworkEnv.TESTNET_042_IBC]: DEVNET_CHAINS,
  [NetworkEnv.DEVNET]: DEVNET_CHAINS,
  [NetworkEnv.DEVNET_042]: DEVNET_CHAINS,
  [NetworkEnv.MAINNET]: DEVNET_CHAINS,
};
