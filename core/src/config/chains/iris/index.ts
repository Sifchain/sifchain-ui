import { NetworkEnv } from "../../getEnv";
import { IRIS_TESTNET } from "./iris-testnet";
import { NetEnvChainConfigLookup } from "../NetEnvChainConfigLookup";
import { IRIS_MAINNET } from "./iris-mainnet";

export default <NetEnvChainConfigLookup>{
  [NetworkEnv.LOCALNET]: IRIS_TESTNET,
  [NetworkEnv.DEVNET]: IRIS_TESTNET,
  [NetworkEnv.TESTNET]: IRIS_TESTNET,
  [NetworkEnv.MAINNET]: IRIS_MAINNET,
  [NetworkEnv.TEMPNET]: IRIS_TESTNET,
  [NetworkEnv.STAGING]: IRIS_TESTNET,
};
