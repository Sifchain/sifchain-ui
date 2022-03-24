import { NetworkEnv } from "../../getEnv";
import { ETHEREUM_TESTNET } from "./ethereum-testnet";
import { ETHEREUM_MAINNET } from "./ethereum-mainnet";
export default {
    [NetworkEnv.TESTNET_042_IBC]: ETHEREUM_TESTNET,
    [NetworkEnv.DEVNET_042]: ETHEREUM_TESTNET,
    [NetworkEnv.DEVNET]: ETHEREUM_TESTNET,
    [NetworkEnv.TESTNET]: ETHEREUM_TESTNET,
    [NetworkEnv.LOCALNET]: ETHEREUM_TESTNET,
    [NetworkEnv.MAINNET]: ETHEREUM_MAINNET,
};
//# sourceMappingURL=index.js.map