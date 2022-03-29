import { NetworkEnv } from "../../getEnv";
import { SENTINEL_MAINNET } from "./sentinel-mainnet";
export default {
  [NetworkEnv.LOCALNET]: SENTINEL_MAINNET,
  [NetworkEnv.TESTNET_042_IBC]: SENTINEL_MAINNET,
  [NetworkEnv.DEVNET_042]: SENTINEL_MAINNET,
  [NetworkEnv.DEVNET_042]: SENTINEL_MAINNET,
  [NetworkEnv.DEVNET]: SENTINEL_MAINNET,
  [NetworkEnv.TESTNET]: SENTINEL_MAINNET,
  [NetworkEnv.MAINNET]: SENTINEL_MAINNET,
};
//# sourceMappingURL=index.js.map
