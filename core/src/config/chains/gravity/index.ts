import { NetworkEnv } from "../../getEnv";
import { NetEnvChainConfigLookup } from "../NetEnvChainConfigLookup";
import { GRAVITY_MAINNET } from "./gravity-mainnet";

export default <NetEnvChainConfigLookup>{
  [NetworkEnv.LOCALNET]: GRAVITY_MAINNET,
  [NetworkEnv.DEVNET]: GRAVITY_MAINNET,
  [NetworkEnv.TESTNET]: GRAVITY_MAINNET,
  [NetworkEnv.MAINNET]: GRAVITY_MAINNET,
  [NetworkEnv.TEMPNET]: GRAVITY_MAINNET,
  [NetworkEnv.STAGING]: GRAVITY_MAINNET,
};
