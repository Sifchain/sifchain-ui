import { NetworkEnv } from "../../getEnv";
import { NetEnvChainConfigLookup } from "../NetEnvChainConfigLookup";
import { SENTINEL_MAINNET } from "./sentinel-mainnet";

export default <NetEnvChainConfigLookup>{
  [NetworkEnv.LOCALNET]: SENTINEL_MAINNET,
  [NetworkEnv.DEVNET]: SENTINEL_MAINNET,
  [NetworkEnv.TESTNET]: SENTINEL_MAINNET,
  [NetworkEnv.MAINNET]: SENTINEL_MAINNET,
};
