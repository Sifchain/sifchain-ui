import { NetworkEnv } from "../../getEnv";
import { NetEnvChainConfigLookup } from "../NetEnvChainConfigLookup";
import { JUNO_MAINNET } from "./juno-mainnet";
import { JUNO_TESTNET } from "./juno-testnet";

export default <NetEnvChainConfigLookup>{
  [NetworkEnv.LOCALNET]: JUNO_TESTNET,
  [NetworkEnv.DEVNET]: JUNO_TESTNET,
  [NetworkEnv.TESTNET]: JUNO_TESTNET,
  [NetworkEnv.MAINNET]: JUNO_MAINNET,
};
