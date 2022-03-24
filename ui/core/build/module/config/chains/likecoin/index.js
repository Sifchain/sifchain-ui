import { NetworkEnv } from "../../getEnv";
import { LIKECOIN_MAINNET } from "./likecoin-mainnet";
export default {
    [NetworkEnv.LOCALNET]: LIKECOIN_MAINNET,
    [NetworkEnv.TESTNET_042_IBC]: LIKECOIN_MAINNET,
    [NetworkEnv.DEVNET_042]: LIKECOIN_MAINNET,
    [NetworkEnv.DEVNET]: LIKECOIN_MAINNET,
    [NetworkEnv.TESTNET]: LIKECOIN_MAINNET,
    [NetworkEnv.MAINNET]: LIKECOIN_MAINNET,
};
//# sourceMappingURL=index.js.map