import { NetworkEnv } from "../../getEnv";
import { NetEnvChainConfigLookup } from "../NetEnvChainConfigLookup";

import { SECRET_MAINNET } from "./secret-mainnet";

export default <NetEnvChainConfigLookup>{
  [NetworkEnv.LOCALNET]: SECRET_MAINNET,
  [NetworkEnv.DEVNET]: SECRET_MAINNET,
  [NetworkEnv.TESTNET]: SECRET_MAINNET,
  [NetworkEnv.MAINNET]: SECRET_MAINNET,
};
