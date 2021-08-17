import { Network, IAssetAmount, WalletConnection } from "../../entities";

export interface WalletActions {
  load(network: Network): Promise<WalletConnection>;
  getBalances(
    network: Network,
    current: { address: string; balances: IAssetAmount[] },
  ): Promise<{ balances: IAssetAmount[]; changed: boolean }>;
  disconnect(network: Network): Promise<void>;
}
