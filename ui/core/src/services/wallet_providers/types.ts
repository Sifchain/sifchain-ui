import { Chain } from "index";
import TypedEmitter from "typed-emitter";
import { EventEmitter } from "events";
import { Keplr } from "@keplr-wallet/types";
import { Network, IAssetAmount } from "entities";
import { KeplrWalletProvider } from "./KeplrWalletProvider";

export type WalletConnectionState = {
  chain: Chain;
  // TODO: figure out why this provider type hates me.
  provider: WalletProvider | CosmosWalletProvider | KeplrWalletProvider;
  balances: IAssetAmount[];
  address: string;
};

interface WalletProviderEvents {
  connect: (state: WalletConnectionState) => void;
  disconnect: (state: WalletConnectionState) => void;
}

export type WalletProviderContext = {
  sifApiUrl: string;
};

export abstract class WalletProvider extends (EventEmitter as new () => TypedEmitter<WalletProviderEvents>) {
  abstract supportedProtocols: Network[];

  abstract context: WalletProviderContext;

  // abstract async isEnabled(chain: Chain): Promise<boolean>;
  abstract async connect(chain: Chain): Promise<WalletConnectionState>;

  abstract async canDisconnect(chain: Chain): Promise<boolean>;
  abstract async disconnect(chain: Chain): Promise<void>;

  abstract async fetchBalances(
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
