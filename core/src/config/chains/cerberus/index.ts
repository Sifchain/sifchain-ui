import { NetworkEnv } from "../../getEnv";
import { NetEnvChainConfigLookup } from "../NetEnvChainConfigLookup";

import { CERBERUS_TESTNET } from "./cerberus-testnet";

export default <NetEnvChainConfigLookup>{
  [NetworkEnv.LOCALNET]: CERBERUS_TESTNET,
  [NetworkEnv.DEVNET]: CERBERUS_TESTNET,
  [NetworkEnv.TESTNET]: CERBERUS_TESTNET,
  [NetworkEnv.MAINNET]: CERBERUS_TESTNET,
};
