import { KEPLR_CONFIG } from "../config";
import { getExtensionPage } from "../utils";
import urls from "../data/urls.json";

export class KeplrNotificationPopup {
  constructor(config = KEPLR_CONFIG) {
    this.config = config;
    this.el = {
      approveButton: 'button:has-text("Approve")',
    };
  }

  async navigate(url = urls.keplr.notificationPopup.generic) {
    this.page = await getExtensionPage(this.config.id, url);
    await this.page.waitForLoadState();
  }

  async clickApprove() {
    await this.page.click(this.el.approveButton);
  }

  async isApproveEnabled() {
    const enabled = await this.page.isEnabled(this.el.approveButton, {
      timeout: 1000,
    });

    return enabled;
  }

  async close() {
    await this.page.close();
  }

  async reload() {
    await this.page.reload();
  }

  async verifyNetworkName(name) {
    await this.page.waitForSelector(`text=${name}`);
  }
}

export const keplrNotificationPopup = new KeplrNotificationPopup();
