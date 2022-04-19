import { NetworkEnv } from "../../getEnv";
import { NetEnvChainConfigLookup } from "../NetEnvChainConfigLookup";

import { COMDEX_TESTNET } from "./comdex-testnet";

export default <NetEnvChainConfigLookup>{
  [NetworkEnv.LOCALNET]: COMDEX_TESTNET,
  [NetworkEnv.DEVNET]: COMDEX_TESTNET,
  [NetworkEnv.TESTNET]: COMDEX_TESTNET,
  [NetworkEnv.MAINNET]: COMDEX_TESTNET,
};
