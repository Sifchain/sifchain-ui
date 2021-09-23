import { Chain } from "../../entities";
import {
  KeplrWalletProvider,
  MetamaskWalletProvider,
} from "../../clients/wallets";
import { provider } from "web3-core";

export type WalletServiceContext = {
  sifRpcUrl: string;
  sifApiUrl: string;
  sifChainId: string;
  chains: Chain[];
  getWeb3Provider: () => Promise<provider>;
};

export class WalletService {
  protected constructor(private context: WalletServiceContext) {}
  static create(context: WalletServiceContext) {
    return new this(context);
  }

  keplrProvider = new KeplrWalletProvider(this.context);
  metamaskProvider = new MetamaskWalletProvider(this.context);

  tryConnectAllWallets() {
    return this.keplrProvider.tryConnectAll(...this.context.chains);
  }
}
export default WalletService.create.bind(WalletService);
