"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getEnv_1 = require("../../getEnv");
const starname_testnet_1 = require("./starname-testnet");
exports.default = {
    [getEnv_1.NetworkEnv.LOCALNET]: starname_testnet_1.STARNAME_TESTNET,
    [getEnv_1.NetworkEnv.TESTNET_042_IBC]: starname_testnet_1.STARNAME_TESTNET,
    [getEnv_1.NetworkEnv.DEVNET_042]: starname_testnet_1.STARNAME_TESTNET,
    [getEnv_1.NetworkEnv.DEVNET_042]: starname_testnet_1.STARNAME_TESTNET,
    [getEnv_1.NetworkEnv.DEVNET]: starname_testnet_1.STARNAME_TESTNET,
    [getEnv_1.NetworkEnv.TESTNET]: starname_testnet_1.STARNAME_TESTNET,
    [getEnv_1.NetworkEnv.MAINNET]: starname_testnet_1.STARNAME_TESTNET,
};
//# sourceMappingURL=index.js.map