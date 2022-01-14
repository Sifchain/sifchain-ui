export class WalletConnect {
  constructor() {
    this.el = {
      connectNetworkButton: (network) =>
        `[data-handle="button-connect-network"]:has-text("${network}")`,
      // connectNetworkButtons: '[data-handle="button-connect-network"]', // not needed, remove me
    };
  }

  async clickConnect(network) {
    await page.click(this.el.connectNetworkButton(network));
    // await page.click(`${this.el.connectNetworkButton}:has-text("${network}")`) // not needed, remove me
  }
}

export const walletConnect = new WalletConnect();
