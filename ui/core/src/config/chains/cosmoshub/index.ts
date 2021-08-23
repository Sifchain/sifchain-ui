import { NetworkEnv } from "../../getEnv";
import { COSMOSHUB_TESTNET } from "./cosmoshub-testnet";
import { NetEnvChainConfigLookup } from "../NetEnvChainConfigLookup";

export default <NetEnvChainConfigLookup>{
  [NetworkEnv.TESTNET_042_IBC]: COSMOSHUB_TESTNET,
  [NetworkEnv.DEVNET_042]: COSMOSHUB_TESTNET,
  [NetworkEnv.DEVNET]: COSMOSHUB_TESTNET,
  [NetworkEnv.TESTNET]: COSMOSHUB_TESTNET,
};
