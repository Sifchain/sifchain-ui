import { NetworkEnv } from "../../getEnv";
import { NetEnvChainConfigLookup } from "../NetEnvChainConfigLookup";

import { CHIHUAHUA_TESTNET } from "./chihuahua-testnet";

export default <NetEnvChainConfigLookup>{
  [NetworkEnv.LOCALNET]: CHIHUAHUA_TESTNET,
  [NetworkEnv.DEVNET]: CHIHUAHUA_TESTNET,
  [NetworkEnv.TESTNET]: CHIHUAHUA_TESTNET,
  [NetworkEnv.MAINNET]: CHIHUAHUA_TESTNET,
};
