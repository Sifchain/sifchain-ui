import { NetworkEnv } from "../../getEnv";
import { BAND_TESTNET } from "./band-testnet";
export default {
  [NetworkEnv.LOCALNET]: BAND_TESTNET,
  [NetworkEnv.TESTNET_042_IBC]: BAND_TESTNET,
  [NetworkEnv.DEVNET_042]: BAND_TESTNET,
  [NetworkEnv.DEVNET]: BAND_TESTNET,
  [NetworkEnv.TESTNET]: BAND_TESTNET,
  [NetworkEnv.MAINNET]: BAND_TESTNET,
};
//# sourceMappingURL=index.js.map
