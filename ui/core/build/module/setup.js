import { IBCBridge } from "./clients/bridges/IBCBridge/IBCBridge";
import { EthBridge } from "./clients/bridges/EthBridge/EthBridge";
import { LiquidityClient } from "./clients/liquidity";
import { networkChainCtorLookup } from "./clients";
import { getSdkConfig } from "./utils/getSdkConfig";
export function createSdk(options) {
  const config = getSdkConfig(options);
  const chains = Object.fromEntries(
    Object.keys(networkChainCtorLookup).map((network) => {
      const n = network;
      return [
        n,
        new networkChainCtorLookup[n]({
          assets: config.assets,
          chainConfig: config.chainConfigsByNetwork[network],
        }),
      ];
    }),
  );
  return {
    context: config,
    chains,
    bridges: {
      ibc: new IBCBridge(config),
      eth: new EthBridge(config),
    },
    liquidity: new LiquidityClient(config, chains.sifchain),
  };
}
//# sourceMappingURL=setup.js.map
