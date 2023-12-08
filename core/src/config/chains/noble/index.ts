import { NetworkEnv } from "../../getEnv";
import { NetEnvChainConfigLookup } from "../NetEnvChainConfigLookup";
import { NOBLE_MAINNET } from "./noble-mainnet";

export default <NetEnvChainConfigLookup>{
  [NetworkEnv.LOCALNET]: NOBLE_MAINNET,
  [NetworkEnv.DEVNET]: NOBLE_MAINNET,
  [NetworkEnv.TESTNET]: NOBLE_MAINNET,
  [NetworkEnv.MAINNET]: NOBLE_MAINNET,
  [NetworkEnv.TEMPNET]: NOBLE_MAINNET,
  [NetworkEnv.STAGING]: NOBLE_MAINNET,
};
