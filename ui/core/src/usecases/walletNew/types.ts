import { Network, IAssetAmount, WalletConnection } from "../../entities";

export interface WalletActions {
  load(network: Network): Promise<WalletConnection>;
  getBalances(network: Network, address: string): Promise<IAssetAmount[]>;
  disconnect(network: Network): Promise<void>;
}
