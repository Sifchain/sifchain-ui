import { NetworkEnv } from "../../getEnv";
import { COSMOSHUB_TESTNET } from "./cosmoshub-testnet";
import { NetEnvChainConfigLookup } from "../NetEnvChainConfigLookup";
import { COSMOSHUB_MAINNET } from "./cosmoshub-mainnet";

export default <NetEnvChainConfigLookup>{
  [NetworkEnv.MAINNET]: COSMOSHUB_MAINNET,
  [NetworkEnv.LOCALNET]: COSMOSHUB_TESTNET,
  [NetworkEnv.DEVNET]: COSMOSHUB_TESTNET,
  [NetworkEnv.TESTNET]: COSMOSHUB_TESTNET,
  [NetworkEnv.TEMPNET]: COSMOSHUB_TESTNET,
  [NetworkEnv.STAGING]: COSMOSHUB_TESTNET,
};
