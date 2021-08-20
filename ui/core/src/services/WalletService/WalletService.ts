export type WalletServiceContext = {
  sifApiUrl: string;
};

export * from "./walletProviders";

import { KeplrWalletProvider } from "./walletProviders";

export class WalletService {
  keplrProvider: KeplrWalletProvider;
  constructor(context: WalletServiceContext) {
    this.keplrProvider = new KeplrWalletProvider(context);
  }
  static create(context: WalletServiceContext) {
    return new WalletService(context);
  }
}
export default WalletService.create;
