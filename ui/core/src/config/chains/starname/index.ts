import { NetworkEnv } from "../../getEnv";
import { NetEnvChainConfigLookup } from "../NetEnvChainConfigLookup";

import { STARNAME_TESTNET } from "./starname-testnet";

export default <NetEnvChainConfigLookup>{
  [NetworkEnv.LOCALNET]: STARNAME_TESTNET,
  [NetworkEnv.TESTNET_042_IBC]: STARNAME_TESTNET,
  [NetworkEnv.DEVNET_042]: STARNAME_TESTNET,
  [NetworkEnv.DEVNET_042]: STARNAME_TESTNET,
  [NetworkEnv.DEVNET]: STARNAME_TESTNET,
  [NetworkEnv.TESTNET]: STARNAME_TESTNET,
  [NetworkEnv.MAINNET]: STARNAME_TESTNET,
};
