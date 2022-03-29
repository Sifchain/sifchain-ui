import { connectPopup } from "./pages/ConnectPopup";
import { dexHeader } from "./pages/components/DexHeader";
import { metamaskConnectPage } from "./pages/MetamaskConnectPage";
import { keplrNotificationPopup } from "./pages/KeplrNotificationPopup";
import { metamaskPage } from "./pages/MetaMaskPage";
import { keplrPage } from "./pages/KeplrPage";
import { balancesPage } from "./pages/BalancesPage";
import urls from "./data/urls.json";

export async function setupExtensions() {
  await metamaskPage.navigate();
  await metamaskPage.setup();

  await keplrPage.navigate();
  await keplrPage.setup();

  // goto dex page
  await balancesPage.navigate();

  // once keplr has finished setup, connection page will be invoked automatically
  await context.waitForEvent("page");

  await connectKeplrAccount();
  await connectMetaMaskAccount();
  await page.close();
}

export async function resetExtensionsConnection() {
  page = await context.newPage(); // TODO: move it to global setup
  await balancesPage.navigate();

  await reconnectKeplrAccount();
  await connectPopup.verifyKeplrConnected();
  await connectPopup.close();

  await metamaskPage.reset();
  await page.bringToFront();
}

export async function connectKeplrAccount() {
  // it's not necessary to invoke connectPopup.clickConnectKeplr()
  // since connect popup is automatically invoked after the setup has completed
  await keplrNotificationPopup.navigate(urls.keplr.notificationPopup.connect);
  await keplrNotificationPopup.clickApprove();
  // new page opens
  await context.waitForEvent("page");

  await keplrNotificationPopup.navigate(
    urls.keplr.notificationPopup.signinApprove,
  );
  await keplrNotificationPopup.clickApprove();
}

export async function reconnectKeplrAccount() {
  await dexHeader.clickConnected();
  const isConnected = await connectPopup.isKeplrConnected();
  if (!isConnected) await connectPopup.clickConnectKeplr();
}

export async function connectMetaMaskAccount() {
  await page.bringToFront();
  await dexHeader.clickConnected();
  await connectPopup.clickConnectMetamask(); // opens new page

  await context.waitForEvent("page");
  await page.waitForTimeout(2000); // TODO: replace explicit wait with dynamic waiting for new page (which happens line above but is a bit flaky)

  await metamaskConnectPage.navigate();
  await metamaskConnectPage.clickNext();
  await metamaskConnectPage.clickConnect();
  await connectPopup.close();
}
