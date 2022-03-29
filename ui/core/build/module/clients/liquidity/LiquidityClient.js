import { BaseLiquidityClient } from "./BaseLiquidityClient";
import { SwapClient } from "./SwapClient";
export class LiquidityClient extends BaseLiquidityClient {
  constructor() {
    super(...arguments);
    this.swap = new SwapClient(this.context, this.nativeChain);
  }
}
//# sourceMappingURL=LiquidityClient.js.map
