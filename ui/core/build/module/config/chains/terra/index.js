import { NetworkEnv } from "../../getEnv";
import { TERRA_TESTNET } from "./terra-testnet";
import { TERRA_MAINNET } from "./terra-mainnet";
export default {
    [NetworkEnv.LOCALNET]: TERRA_TESTNET,
    [NetworkEnv.TESTNET_042_IBC]: TERRA_TESTNET,
    [NetworkEnv.DEVNET_042]: TERRA_TESTNET,
    [NetworkEnv.DEVNET]: TERRA_TESTNET,
    [NetworkEnv.TESTNET]: TERRA_TESTNET,
    [NetworkEnv.MAINNET]: TERRA_MAINNET,
};
//# sourceMappingURL=index.js.map