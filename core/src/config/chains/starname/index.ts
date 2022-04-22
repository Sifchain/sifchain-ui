import { NetworkEnv } from "../../getEnv";
import { NetEnvChainConfigLookup } from "../NetEnvChainConfigLookup";

import { STARNAME_TESTNET } from "./starname-testnet";
import { STARNAME_MAINNET } from "./starname-mainnet";
export default <NetEnvChainConfigLookup>{
  [NetworkEnv.LOCALNET]: STARNAME_TESTNET,
  [NetworkEnv.DEVNET]: STARNAME_TESTNET,
  [NetworkEnv.TESTNET]: STARNAME_TESTNET,
  [NetworkEnv.MAINNET]: STARNAME_MAINNET,
};
