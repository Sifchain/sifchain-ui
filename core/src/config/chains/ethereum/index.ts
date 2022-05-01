import { NetworkEnv } from "../../getEnv";
import { NetEnvChainConfigLookup } from "../NetEnvChainConfigLookup";
import { ETHEREUM_TESTNET } from "./ethereum-testnet";
import { ETHEREUM_MAINNET } from "./ethereum-mainnet";

export default <NetEnvChainConfigLookup>{
  [NetworkEnv.DEVNET]: ETHEREUM_TESTNET,
  [NetworkEnv.TESTNET]: ETHEREUM_TESTNET,
  [NetworkEnv.LOCALNET]: ETHEREUM_TESTNET,
  [NetworkEnv.MAINNET]: ETHEREUM_MAINNET,
};
