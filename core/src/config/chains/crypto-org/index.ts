import { NetworkEnv } from "../../getEnv";
import { NetEnvChainConfigLookup } from "../NetEnvChainConfigLookup";
import { CRYPTO_ORG_MAINNET } from "./crypto-org-mainnet";

export default <NetEnvChainConfigLookup>{
  [NetworkEnv.LOCALNET]: CRYPTO_ORG_MAINNET,
  [NetworkEnv.DEVNET]: CRYPTO_ORG_MAINNET,
  [NetworkEnv.TESTNET]: CRYPTO_ORG_MAINNET,
  [NetworkEnv.MAINNET]: CRYPTO_ORG_MAINNET,
  [NetworkEnv.TEMPNET]: CRYPTO_ORG_MAINNET,
  [NetworkEnv.STAGING]: CRYPTO_ORG_MAINNET,
};
