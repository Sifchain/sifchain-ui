"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiquidityClient = void 0;
const BaseLiquidityClient_1 = require("./BaseLiquidityClient");
const SwapClient_1 = require("./SwapClient");
class LiquidityClient extends BaseLiquidityClient_1.BaseLiquidityClient {
    constructor() {
        super(...arguments);
        this.swap = new SwapClient_1.SwapClient(this.context, this.nativeChain);
    }
}
exports.LiquidityClient = LiquidityClient;
//# sourceMappingURL=LiquidityClient.js.map