import { IAsset } from "entities";

/* 
  The idea here is that, as we add more external wallets, we can use this as a base class to
  standardize common functionality. 
  Then have a wallet controller with a method like `getWalletByNetwork(network: Network)` 
  that returns an inheritant of this class.
*/
export class GenericWallet {
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
