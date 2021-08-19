import { Chain } from "index";
import TypedEmitter from "typed-emitter";
import { EventEmitter } from "events";
import { OfflineSigner } from "@cosmjs/proto-signing";
import { Network, IAssetAmount } from "entities";

export type WalletConnectionState = {
  chain: Chain;
  provider: WalletProvider;
  balances: IAssetAmount[];
  address: string;
};

interface WalletProviderEvents {
  loaded: (state: WalletConnectionState) => void;
  unloaded: (state: WalletConnectionState) => void;
  balances_changed: (state: WalletConnectionState) => void;
}

export abstract class WalletProvider extends (EventEmitter as new () => TypedEmitter<WalletProviderEvents>) {
  abstract supportedProtocols: Network[];

  abstract async isLoaded(chain: Chain): Promise<boolean>;
  abstract async load(chain: Chain): Promise<WalletConnectionState | undefined>;
  abstract async unload(chain: Chain): Promise<void>;

  abstract async fetchBalances(
    state: WalletConnectionState,
  ): Promise<IAssetAmount[]>;
  abstract async fetchAndEmitChangedBalances(
    state: WalletConnectionState,
  ): Promise<IAssetAmount[] | undefined>;
}
export abstract class CosmosWalletProvider extends WalletProvider {
  abstract getSendingSigner(chain: Chain): Promise<OfflineSigner>;
}
