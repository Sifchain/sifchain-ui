import { NetworkEnv } from "../../getEnv";
import { NetEnvChainConfigLookup } from "../NetEnvChainConfigLookup";

import { COMDEX_TESTNET } from "./comdex-testnet";
import { COMDEX_MAINNET } from "./comdex-mainnet";

export default <NetEnvChainConfigLookup>{
  [NetworkEnv.LOCALNET]: COMDEX_TESTNET,
  [NetworkEnv.DEVNET]: COMDEX_TESTNET,
  [NetworkEnv.TESTNET]: COMDEX_TESTNET,
  [NetworkEnv.MAINNET]: COMDEX_MAINNET,
  [NetworkEnv.TEMPNET]: COMDEX_TESTNET,
  [NetworkEnv.STAGING]: COMDEX_TESTNET,
};
