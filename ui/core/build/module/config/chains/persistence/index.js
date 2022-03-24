import { NetworkEnv } from "../../getEnv";
import { PERSISTENCE_TESTNET } from "./persistence-testnet";
import { PERSISTENCE_MAINNET } from "./persistence-mainnet";
export default {
    [NetworkEnv.LOCALNET]: PERSISTENCE_TESTNET,
    [NetworkEnv.TESTNET_042_IBC]: PERSISTENCE_TESTNET,
    [NetworkEnv.DEVNET_042]: PERSISTENCE_TESTNET,
    [NetworkEnv.DEVNET]: PERSISTENCE_TESTNET,
    [NetworkEnv.TESTNET]: PERSISTENCE_TESTNET,
    [NetworkEnv.MAINNET]: PERSISTENCE_MAINNET,
};
//# sourceMappingURL=index.js.map