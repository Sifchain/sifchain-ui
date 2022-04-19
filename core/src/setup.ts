import { Network, Chain } from "./entities";
import { NetworkEnv } from "./config/getEnv";
import { IBCBridge } from "./clients/bridges/IBCBridge/IBCBridge";
import { EthBridge } from "./clients/bridges/EthBridge/EthBridge";
import { LiquidityClient } from "./clients/liquidity";
import { networkChainCtorLookup } from "./clients";
import { getSdkConfig } from "./utils/getSdkConfig";

type ActiveNetworks = keyof typeof networkChainCtorLookup;

export function createSdk(options: { environment: NetworkEnv }) {
  const config = getSdkConfig(options);
  const chains = Object.fromEntries(
    Object.keys(networkChainCtorLookup).map((network) => {
      const n = network as ActiveNetworks;

      const Ctor = networkChainCtorLookup[n];
      const chainConfig = config.chainConfigsByNetwork[n];

      return [n, new Ctor({ assets: config.assets, chainConfig })] as [
        Network,
        Chain,
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
