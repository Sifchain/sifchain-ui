import { NetworkEnv } from "../../getEnv";
import { AKASH_TESTNET } from "./akash-testnet";
import { AKASH_MAINNET } from "./akash-mainnet";
export default {
  [NetworkEnv.LOCALNET]: AKASH_TESTNET,
  [NetworkEnv.TESTNET_042_IBC]: AKASH_TESTNET,
  [NetworkEnv.DEVNET_042]: AKASH_TESTNET,
  [NetworkEnv.DEVNET]: AKASH_TESTNET,
  [NetworkEnv.TESTNET]: AKASH_TESTNET,
  [NetworkEnv.MAINNET]: AKASH_MAINNET,
};
//# sourceMappingURL=index.js.map
