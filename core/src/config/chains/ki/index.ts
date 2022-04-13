import { NetworkEnv } from "../../getEnv";
import { NetEnvChainConfigLookup } from "../NetEnvChainConfigLookup";

import { KI_TESTNET } from "./ki-testnet";

export default <NetEnvChainConfigLookup>{
  [NetworkEnv.LOCALNET]: KI_TESTNET,
  [NetworkEnv.DEVNET]: KI_TESTNET,
  [NetworkEnv.TESTNET]: KI_TESTNET,
  [NetworkEnv.MAINNET]: KI_TESTNET,
};
