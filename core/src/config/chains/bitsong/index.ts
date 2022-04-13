import { NetworkEnv } from "../../getEnv";
import { NetEnvChainConfigLookup } from "../NetEnvChainConfigLookup";

import { BITSONG_TESTNET } from "./bitsong-testnet";

export default <NetEnvChainConfigLookup>{
  [NetworkEnv.LOCALNET]: BITSONG_TESTNET,
  [NetworkEnv.DEVNET]: BITSONG_TESTNET,
  [NetworkEnv.TESTNET]: BITSONG_TESTNET,
  [NetworkEnv.MAINNET]: BITSONG_TESTNET,
};
