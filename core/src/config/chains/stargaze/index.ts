import { NetworkEnv } from "../../getEnv";
import { NetEnvChainConfigLookup } from "../NetEnvChainConfigLookup";
import { STARGAZE_MAINNET } from "./stargaze-mainnet";
import { STARGAZE_TESTNET } from "./stargaze-testnet";

export default <NetEnvChainConfigLookup>{
  [NetworkEnv.LOCALNET]: STARGAZE_TESTNET,
  [NetworkEnv.DEVNET]: STARGAZE_TESTNET,
  [NetworkEnv.TESTNET]: STARGAZE_TESTNET,
  [NetworkEnv.MAINNET]: STARGAZE_MAINNET,
  [NetworkEnv.TEMPNET]: STARGAZE_TESTNET,
  [NetworkEnv.STAGING]: STARGAZE_TESTNET,
};
