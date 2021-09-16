import { Chain } from "index";
import { KeplrWalletProvider } from "../../clients/wallets";

export type WalletServiceContext = {
  sifRpcUrl: string;
  sifApiUrl: string;
  sifChainId: string;
  chains: Chain[];
};

export class WalletService {
  keplrProvider: KeplrWalletProvider;
  chains: Chain[];
  protected constructor(context: WalletServiceContext) {
    this.chains = context.chains;
    this.keplrProvider = new KeplrWalletProvider(context);
  }
  tryConnectAllWallets() {
    return this.keplrProvider.tryConnectAll(...this.chains);
  }
  static create(context: WalletServiceContext) {
    return new this(context);
  }
}
export default WalletService.create.bind(WalletService);
