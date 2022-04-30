import { NetworkEnv } from "../../getEnv";
import { TERRA_TESTNET } from "./terra-testnet";
import { NetEnvChainConfigLookup } from "../NetEnvChainConfigLookup";
import { TERRA_MAINNET } from "./terra-mainnet";

export default <NetEnvChainConfigLookup>{
  [NetworkEnv.LOCALNET]: TERRA_TESTNET,
  [NetworkEnv.DEVNET]: TERRA_TESTNET,
  [NetworkEnv.TESTNET]: TERRA_TESTNET,
  [NetworkEnv.MAINNET]: TERRA_MAINNET,
};
