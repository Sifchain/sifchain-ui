import { IAssetAmount, Chain } from "../../entities";
// import {
//   NativeDexSignedTransaction,
//   NativeDexTransaction,
// } from "../../services/utils/SifClient/NativeDexTransaction";

export type WalletProviderContext = {
  sifRpcUrl: string;
  sifChainId: string;
  sifApiUrl: string;
};

export abstract class WalletProvider<T> {
  abstract context: WalletProviderContext;

  abstract isChainSupported(chain: Chain): boolean;

  // abstract async isEnabled(chain: Chain): Promise<boolean>;
  abstract connect(chain: Chain): Promise<string>;
  abstract hasConnected(chain: Chain): Promise<boolean>;

  abstract canDisconnect(chain: Chain): boolean;
  abstract disconnect(chain: Chain): Promise<void>;

  abstract fetchBalances(
    chain: Chain,
    address: string,
  ): Promise<IAssetAmount[]>;
}
