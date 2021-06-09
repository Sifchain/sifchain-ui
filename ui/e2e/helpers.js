import { connectPopup } from "./pages/ConnectPopup";
import { dexHeader } from "./pages/components/DexHeader";
import { metamaskConnectPage } from "./pages/MetamaskConnectPage";
import { keplrNotificationPopup } from "./pages/KeplrNotificationPopup";
import urls from "./data/urls.json";

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
