import { Network, Chain, Wallet } from "./entities";
import { getConfig } from "./config/getConfig";
import { NetworkEnv, profileLookup } from "./config/getEnv";
import { WalletProviderContext } from "./clients/wallets";
import { CosmosWalletProvider, Web3WalletProvider } from "./clients/wallets";
import { IBCBridge } from "./clients/bridges/IBCBridge/IBCBridge";
import { networkChainCtorLookup } from "./services/ChainsService";
import { EthBridge } from "./clients/bridges/EthBridge/EthBridge";
import { LiquidityClient } from "./clients/liquidity";

export const getSdkConfig = (params: { environment: NetworkEnv }) => {
  const { tag, ethAssetTag, sifAssetTag } = profileLookup[params.environment];
  if (typeof tag == "undefined")
    throw new Error("environment " + params.environment + " not found");

  return getConfig(tag, sifAssetTag, ethAssetTag);
};

export function createSdk(options: { environment: NetworkEnv }) {
  const config = getSdkConfig(options);
  const chains = Object.fromEntries(
    Object.keys(networkChainCtorLookup).map((network) => {
      return [
        network,
        new networkChainCtorLookup[network as Network]({
          assets: config.assets,
          chainConfig: config.chainConfigsByNetwork[network as Network],
        }),
      ];
    }),
  ) as unknown as Record<Network, Chain>;
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
