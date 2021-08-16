import { NetworkEnv } from "../../getEnv";
import { IRIS_TESTNET } from "./iris-testnet";
import { NetEnvChainConfigLookup } from "../NetEnvChainConfigLookup";

export default <NetEnvChainConfigLookup>{
  [NetworkEnv.TESTNET_042_IBC]: IRIS_TESTNET,
  [NetworkEnv.DEVNET_042]: IRIS_TESTNET,
  [NetworkEnv.DEVNET]: IRIS_TESTNET,
};
