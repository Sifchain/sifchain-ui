import { Chain, Network } from "@sifchain/sdk";
import { provider } from "web3-core";

import { MetamaskWalletProvider } from "@sifchain/wallet-metamask";
import { KeplrWalletProvider } from "@sifchain/wallet-keplr";
import { TerraStationWalletProvider } from "@sifchain/wallet-terra-station";
import { XdefiWalletProvider } from "@sifchain/wallet-xdefi";

export type WalletServiceContext = {
  sifRpcUrl: string;
  sifApiUrl: string;
  sifChainId: string;
  chains: Chain[];
  getWeb3Provider: () => Promise<provider>;
};

export class WalletService {
  keplrProvider: KeplrWalletProvider;
  metamaskProvider: MetamaskWalletProvider;
  terraProvider: TerraStationWalletProvider;
  xdefiProvider: XdefiWalletProvider;

  protected constructor(public context: WalletServiceContext) {
    this.keplrProvider = new KeplrWalletProvider(context);
    this.metamaskProvider = new MetamaskWalletProvider(context);
    this.terraProvider = new TerraStationWalletProvider(context);
    this.xdefiProvider = new XdefiWalletProvider(context);
  }
  static create(context: WalletServiceContext) {
    return new this(context);
  }

  getPreferredProvider(chain: Chain) {
    switch (chain.network) {
      case Network.ETHEREUM:
        return this.metamaskProvider;
      case Network.TERRA:
        return this.terraProvider;
      case Network.SIFCHAIN:
        return this.xdefiProvider;
      default:
        return this.keplrProvider;
    }
  }

  tryConnectAllWallets() {
    return this.keplrProvider.tryConnectAll(
      ...this.context.chains.filter(
        (chain) =>
          !chain.chainConfig.hidden &&
          this.getPreferredProvider(chain) === this.keplrProvider,
      ),
    );
  }
}
export default WalletService.create.bind(WalletService);
