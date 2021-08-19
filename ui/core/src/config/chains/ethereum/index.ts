import { NetworkEnv } from "../../getEnv";
import { NetEnvChainConfigLookup } from "../NetEnvChainConfigLookup";
import { ETHEREUM_DEVNET } from "./ethereum-devnet";
import { ETHEREUM_MAINNET } from "./ethereum-mainnet";

export default <NetEnvChainConfigLookup>{
  [NetworkEnv.TESTNET_042_IBC]: ETHEREUM_DEVNET,
  [NetworkEnv.TESTNET]: ETHEREUM_DEVNET,
  [NetworkEnv.DEVNET_042]: ETHEREUM_DEVNET,
  [NetworkEnv.DEVNET]: ETHEREUM_DEVNET,
  [NetworkEnv.MAINNET]: ETHEREUM_MAINNET,
};
