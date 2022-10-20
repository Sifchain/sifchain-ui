import { IBCChainConfig, Network } from "@sifchain/sdk";
import type { IBCBridgeContext as _IBCServiceContext } from "@sifchain/sdk/src/clients/bridges/IBCBridge/IBCBridge";
import { IBCBridge } from "@sifchain/sdk/src/clients/bridges/IBCBridge/IBCBridge";
import { KeplrWalletProvider } from "@sifchain/wallet-keplr";

export type IBCServiceContext = _IBCServiceContext;

// NOTE(ajoslin): this is deprecated, most functionality is moved to IBCBridge
// debug functions only left here or functions with old signatures
export class IBCService extends IBCBridge {
  static create(context: IBCServiceContext) {
    return new IBCService(context);
  }

  keplrProvider?: KeplrWalletProvider;
  setKeplrProvider(keplrProvider: KeplrWalletProvider) {
    this.keplrProvider = keplrProvider;
  }

  async logIBCNetworkMetadata() {
    const destinationNetwork = Network.SIFCHAIN;
    let chainConfig: IBCChainConfig | undefined;

    try {
      chainConfig = this.loadChainConfigByNetwork(destinationNetwork);
    } catch (e) {
      if (process.env.NODE_ENV !== "production") {
        console.log("Chain config not found for network: ", destinationNetwork);
        return;
      }
    }

    const tokenRegistry = await this.tokenRegistry.load();

    if (process.env.NODE_ENV !== "production") {
      console.log({ chainConfig, tokenRegistry });
    }
  }
}

export default function createIBCService(context: IBCServiceContext) {
  return IBCService.create(context);
}
