import { NetworkEnv } from "../../getEnv";
import { JUNO_MAINNET } from "./juno-mainnet";
import { JUNO_TESTNET } from "./juno-testnet";
export default {
    [NetworkEnv.LOCALNET]: JUNO_TESTNET,
    [NetworkEnv.TESTNET_042_IBC]: JUNO_TESTNET,
    [NetworkEnv.DEVNET_042]: JUNO_TESTNET,
    [NetworkEnv.DEVNET_042]: JUNO_TESTNET,
    [NetworkEnv.DEVNET]: JUNO_TESTNET,
    [NetworkEnv.TESTNET]: JUNO_TESTNET,
    [NetworkEnv.MAINNET]: JUNO_MAINNET,
};
//# sourceMappingURL=index.js.map