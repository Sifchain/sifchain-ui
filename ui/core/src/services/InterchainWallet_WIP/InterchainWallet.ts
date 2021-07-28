import { IAsset } from "entities";

/* 
  This functionality seems to largely be handled by IWalletService, but wallet service is not usecase-driven.
  This was fine for v1, where there was only on wallet w/ a bridge network, but for v2, we need to support many
  chains which will likely have idiosyncratic rules and features despite their shared protocols
  The idea here is that, as we add more external wallets, we can use this as a base class to
  standardize common functionality. 
  Then have a wallet controller with a method like `getWalletByNetwork(network: Network)` 
  that returns an inheritant of this class.
*/
export class InterchainWallet {
  async loadAddress(): Promise<string> {
    throw "";
  }
  async importAsset() {}
  async exportAsset() {}
  async loadAssets(): Promise<
    {
      nativeAsset: IAsset;
      counterpartyAsset: IAsset;
    }[]
  > {
    throw "";
  }
}
