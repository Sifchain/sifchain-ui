import { NetworkEnv } from "../../getEnv";
import { NetEnvChainConfigLookup } from "../NetEnvChainConfigLookup";
import { LIKECOIN_MAINNET } from "./likecoin-mainnet";
import { LIKECOIN_TESTNET } from "./likecoin-testnet";

export default <NetEnvChainConfigLookup>{
  [NetworkEnv.LOCALNET]: LIKECOIN_TESTNET,
  [NetworkEnv.DEVNET]: LIKECOIN_TESTNET,
  [NetworkEnv.TESTNET]: LIKECOIN_TESTNET,
  [NetworkEnv.MAINNET]: LIKECOIN_MAINNET,
};
