export class NavBar {
  constructor() {
    this.elements = {
      connect: "[data-handle='button-connect-wallets']",
    };
  }

  async clickConnectWallets() {
    await page.click(this.elements.connect);
  }
}

export const navBar = new NavBar();
