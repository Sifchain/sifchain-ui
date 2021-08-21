import { KeplrWalletProvider } from "../../clients/wallets";

export type WalletServiceContext = {
  sifApiUrl: string;
};

export class WalletService {
  keplrProvider: KeplrWalletProvider;
  protected constructor(context: WalletServiceContext) {
    this.keplrProvider = new KeplrWalletProvider(context);
  }
  static create(context: WalletServiceContext) {
    return new WalletService(context);
  }
}
export default WalletService.create;
