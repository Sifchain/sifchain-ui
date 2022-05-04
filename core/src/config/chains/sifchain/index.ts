import { NetworkEnv } from "../../getEnv";
import { NetEnvChainConfigLookup } from "../NetEnvChainConfigLookup";
import { SIFCHAIN_DEVNET } from "./sifchain-devnet";
import { SIFCHAIN_TESTNET } from "./sifchain-testnet";
import { SIFCHAIN_MAINNET } from "./sifchain-mainnet";
import { SIFCHAIN_LOCALNET } from "./sifchain-localnet";

export default <NetEnvChainConfigLookup>{
  [NetworkEnv.LOCALNET]: SIFCHAIN_LOCALNET,
  [NetworkEnv.DEVNET]: SIFCHAIN_DEVNET,
  [NetworkEnv.TESTNET]: SIFCHAIN_TESTNET,
  [NetworkEnv.MAINNET]: SIFCHAIN_MAINNET,
};
