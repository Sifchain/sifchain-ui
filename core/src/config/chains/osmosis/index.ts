import { NetworkEnv } from "../../getEnv";
import { NetEnvChainConfigLookup } from "../NetEnvChainConfigLookup";
import { OSMOSIS_MAINNET } from "./osmosis-mainnet";

export default <NetEnvChainConfigLookup>{
  [NetworkEnv.LOCALNET]: OSMOSIS_MAINNET,
  [NetworkEnv.DEVNET]: OSMOSIS_MAINNET,
  [NetworkEnv.TESTNET]: OSMOSIS_MAINNET,
  [NetworkEnv.MAINNET]: OSMOSIS_MAINNET,
  [NetworkEnv.TEMPNET]: OSMOSIS_MAINNET,
  [NetworkEnv.STAGING]: OSMOSIS_MAINNET,
};
