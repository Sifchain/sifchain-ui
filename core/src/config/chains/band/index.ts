import { NetworkEnv } from "../../getEnv";
import { BAND_TESTNET } from "./band-testnet";
import { NetEnvChainConfigLookup } from "../NetEnvChainConfigLookup";

export default <NetEnvChainConfigLookup>{
  [NetworkEnv.LOCALNET]: BAND_TESTNET,
  [NetworkEnv.DEVNET]: BAND_TESTNET,
  [NetworkEnv.TESTNET]: BAND_TESTNET,
  [NetworkEnv.MAINNET]: BAND_TESTNET,
  [NetworkEnv.TEMPNET]: BAND_TESTNET,
  [NetworkEnv.STAGING]: BAND_TESTNET,
};
