import { NetworkEnv } from "../../getEnv";
import { EMONEY_MAINNET } from "./emoney-mainnet";
export default {
    [NetworkEnv.LOCALNET]: EMONEY_MAINNET,
    [NetworkEnv.TESTNET_042_IBC]: EMONEY_MAINNET,
    [NetworkEnv.DEVNET_042]: EMONEY_MAINNET,
    [NetworkEnv.DEVNET_042]: EMONEY_MAINNET,
    [NetworkEnv.DEVNET]: EMONEY_MAINNET,
    [NetworkEnv.TESTNET]: EMONEY_MAINNET,
    [NetworkEnv.MAINNET]: EMONEY_MAINNET,
};
//# sourceMappingURL=index.js.map