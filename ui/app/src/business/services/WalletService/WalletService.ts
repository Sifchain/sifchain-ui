import { Chain, Network } from "@sifchain/sdk";
import { provider } from "web3-core";

import { MetamaskWalletProvider } from "@sifchain/wallet-metamask";
import { KeplrWalletProvider } from "@sifchain/wallet-keplr";
import { TerraStationWalletProvider } from "@sifchain/wallet-terra-station";
import { DirectSecp256k1HdWalletProvider } from "@sifchain/sdk/src/clients/wallets";

export type WalletServiceContext = {
  sifRpcUrl: string;
  sifApiUrl: string;
  sifChainId: string;
  chains: Chain[];
  getWeb3Provider: () => Promise<provider>;
};

let isProduction = false;
try {
  isProduction =
    import.meta.env.VITE_APP_DEPLOYMENT === "production" ||
    location.hostname == "dex.sifchain.finance";
} catch (_) {
  // no window.location in node.js
}

let appLoadLocation: string = "";
try {
  appLoadLocation = window.location.href;
} catch (_) {
  // no window.location in node.js
}

export class WalletService {
  keplrProvider: KeplrWalletProvider;
  metamaskProvider: MetamaskWalletProvider;
  terraProvider: TerraStationWalletProvider;

  protected constructor(public context: WalletServiceContext) {
    this.keplrProvider = new KeplrWalletProvider(context);
    this.metamaskProvider = new MetamaskWalletProvider(context);
    this.terraProvider = new TerraStationWalletProvider(context);
  }
  static create(context: WalletServiceContext) {
    return new this(context);
  }

  getPreferredProvider(chain: Chain) {
    switch (chain.network) {
      case Network.ETHEREUM:
        return this.metamaskProvider;
      default:
        return this.getPreferredCosmosProvider(chain);
    }
  }

  _directProvider?: DirectSecp256k1HdWalletProvider;
  getPreferredCosmosProvider(
    chain: Chain,
  ): KeplrWalletProvider | DirectSecp256k1HdWalletProvider {
    if (chain.network === Network.ETHEREUM || chain.network === Network.TERRA) {
      throw new Error(
        "getPreferredCosmosProvider is not supported for ETH or Terra networks",
      );
    }
    // If there's a mnemonic phrase, return a direct signer instead.
    // NOTE: only works for Cosmos chains
    if (!isProduction && appLoadLocation.includes("mnemonic_phrase")) {
      const url = new URL(appLoadLocation);
      const params = new URLSearchParams(url.search);
      const phrase = params.get("mnemonic_phrase");
      if (phrase) {
        if (!this._directProvider) {
          this._directProvider = new DirectSecp256k1HdWalletProvider(
            this.context,
            {
              mnemonic: phrase,
            },
          );
        }
        return this._directProvider;
      }
    }
    return this.keplrProvider;
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
