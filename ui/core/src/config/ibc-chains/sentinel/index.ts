import { NetworkEnv } from "../../getEnv";
import { SENTINEL_TESTNET } from "./sentinel-testnet";
import { NetEnvChainConfigLookup } from "../NetEnvChainConfigLookup";

export default <NetEnvChainConfigLookup>{
  [NetworkEnv.LOCALNET]: SENTINEL_TESTNET,
  [NetworkEnv.TESTNET_042_IBC]: SENTINEL_TESTNET,
  [NetworkEnv.DEVNET_042]: SENTINEL_TESTNET,
  [NetworkEnv.DEVNET_042]: SENTINEL_TESTNET,
  [NetworkEnv.DEVNET]: SENTINEL_TESTNET,
  [NetworkEnv.MAINNET]: SENTINEL_TESTNET,
};
