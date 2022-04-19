import { NetworkEnv } from "../../getEnv";
import { NetEnvChainConfigLookup } from "../NetEnvChainConfigLookup";

import { STARGAZE_TESTNET } from "./stargaze-testnet";

export default <NetEnvChainConfigLookup>{
  [NetworkEnv.LOCALNET]: STARGAZE_TESTNET,
  [NetworkEnv.DEVNET]: STARGAZE_TESTNET,
  [NetworkEnv.TESTNET]: STARGAZE_TESTNET,
  [NetworkEnv.MAINNET]: STARGAZE_TESTNET,
};
