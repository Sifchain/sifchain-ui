import { Keplr } from "@keplr-wallet/types";
import { Network, IAssetAmount, Chain } from "../../entities";
import { KeplrWalletProvider } from "./KeplrWalletProvider";

export type WalletProviderContext = {
  sifApiUrl: string;
};

export type WalletConnectionState = {
  chain: Chain;
  // TODO: figure out why this provider type hates me.
  provider: WalletProvider;
  balances: IAssetAmount[];
  address: string;
};

export abstract class WalletProvider {
  abstract context: WalletProviderContext;

  abstract isChainSupported(chain: Chain): boolean;

  // abstract async isEnabled(chain: Chain): Promise<boolean>;
  abstract connect(chain: Chain): Promise<WalletConnectionState>;
  abstract hasConnected(chain: Chain): Promise<boolean>;

  abstract canDisconnect(chain: Chain): boolean;
  abstract disconnect(chain: Chain): Promise<void>;

  abstract fetchBalances(
    chain: Chain,
    address: string,
  ): Promise<IAssetAmount[]>;
}
export abstract class CosmosWalletProvider extends WalletProvider {
  // NOTE(ajoslin): having issues with getOfflineSigner return type for now...
  // getting around it by referencing it directly this way.
  abstract getSendingSigner(
    chain: Chain,
  ): Promise<ReturnType<Keplr["getOfflineSigner"]>>;
}
