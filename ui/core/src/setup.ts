import { createUsecases, Network, Chain, Wallet } from ".";
import { createApi } from "./api";
import { getConfig } from "./config/getConfig";
import { NetworkEnv, profileLookup } from "./config/getEnv";
import {
  WalletProviderContext,
  KeplrWalletProvider,
  DirectSecp256k1HdWalletProvider,
  DirectSecp256k1HdWalletProviderOptions,
} from "./clients/wallets";
import { CosmosWalletProvider } from "./clients/wallets/CosmosWalletProvider";
import { ChainContext } from "./clients/chains";
import { IBCBridge } from "./clients/bridges/IBCBridge/IBCBridge";
import { noConflict } from "js-cookie";
import { ServiceContext } from "./services";
import { networkChainCtorLookup } from "./services/ChainsService";
import { CoreConfig } from "./utils/parseConfig";

// export type SifchainEnv =
//   | "mainnet"
//   | "testnet"
//   | "devnet"
//   | "localnet"
//   | "devnet_042";
//
type WalletsOption = {
  cosmos: (context: Partial<WalletProviderContext>) => CosmosWalletProvider;
};

export const getSdkConfig = (params: {
  environment: NetworkEnv;
  wallets: WalletsOption;
}) => {
  const { tag, ethAssetTag, sifAssetTag } = profileLookup[params.environment];
  if (typeof tag == "undefined")
    throw new Error("environment " + params.environment + " not found");

  return getConfig(
    tag,
    sifAssetTag,
    ethAssetTag,
    (context: WalletProviderContext) => params.wallets.cosmos(context),
  );
};

export function createSdk(options: {
  environment: NetworkEnv;
  wallets: WalletsOption;
}) {
  const config = getSdkConfig(options);
  return {
    wallets: {
      cosmos: config.cosmosWalletProvider,
    },
    chains: (Object.fromEntries(
      Object.keys(networkChainCtorLookup).map((network) => {
        return [
          network,
          new networkChainCtorLookup[network as Network]({
            assets: config.assets,
            chainConfig: config.chainConfigsByNetwork[network as Network],
          }),
        ];
      }),
    ) as unknown) as Record<Network, Chain>,
    bridges: {
      ibc: new IBCBridge(config),
    },
  };
}
