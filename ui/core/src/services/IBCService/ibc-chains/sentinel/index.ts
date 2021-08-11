import { NetworkEnv } from "../../../../config/getEnv";
import { COSMOSHUB_TESTNET } from "./sentinel-testnet";
import { NetEnvChainConfigLookup } from "../NetEnvChainConfigLookup";

export default <NetEnvChainConfigLookup>{
  [NetworkEnv.TESTNET_042_IBC]: COSMOSHUB_TESTNET,
  [NetworkEnv.DEVNET_042]: COSMOSHUB_TESTNET,
};
