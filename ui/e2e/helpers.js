import { navBar } from "./pages/components/NavBar";
import { metamaskConnectPage } from "./pages/MetamaskConnectPage";
import { keplrNotificationPopup } from "./pages/KeplrNotificationPopup";
import { metamaskPage } from "./pages/MetaMaskPage";
import { keplrPage } from "./pages/KeplrPage";
import { balancesPage } from "./pages/BalancesPage";
import urls from "./data/urls.json";
import { waitUntil, sleep } from "./utils";
import { walletConnect } from "./pages/components/WalletConnect";

export async function setupExtensions() {
  await metamaskPage.navigate();
  await metamaskPage.setup();

  await keplrPage.navigate();
  await keplrPage.setup();

  // goto dex page
  await balancesPage.navigate();

  // once keplr has finished setup, connection page will be invoked automatically
  await context.waitForEvent("page");

  await keplrNotificationPopup.navigate(
    urls.keplr.notificationPopup.signinApprove,
  );
  // await waitUntil(() => prepareKeplrApproveNotification(), 30000, 3000);
  await keplrNotificationPopup.clickApprove();

  await page.bringToFront();
  await navBar.clickConnectWallets();

  await connectMetaMaskAccount();
  await connectKeplrAccount();
}

export async function connectKeplrAccount() {
  // open question: WHY sifchain approval pops up automatically and other IBC connections
  // need to be made through 'Connect' button (apart from Sentinel connection that comes very first)?
  await navBar.clickConnectWallets();
  await walletConnect.clickConnect("Sifchain");
  await approveConnection("sifchain");
  await sleep(1000); // is it needed?

  await walletConnect.clickConnect("Cosmoshub");
  await context.waitForEvent("page");
  await approveConnection("cosmoshub");
}

export async function approveConnection(networkName) {
  await sleep(1000); // is it needed?
  await keplrNotificationPopup.navigate(urls.keplr.notificationPopup.connect);
  await keplrNotificationPopup.verifyNetworkName(networkName);
  // await waitUntil(() => prepareKeplrApproveNotification(), 30000, 3000); // uncomment me
  await keplrNotificationPopup.clickApprove();
  // new page opens
  await context.waitForEvent("page");

  await keplrNotificationPopup.navigate(
    urls.keplr.notificationPopup.signinApprove,
  );
  await keplrNotificationPopup.verifyNetworkName(networkName);
  await keplrNotificationPopup.clickApprove();
}

export async function connectMetaMaskAccount() {
  await walletConnect.clickConnect("Metamask");

  await context.waitForEvent("page");
  await page.waitForTimeout(2000); // TODO: replace explicit wait with dynamic waiting for new page (which happens line above but is a bit flaky)

  await metamaskConnectPage.navigate();
  await metamaskConnectPage.clickNext();
  await metamaskConnectPage.clickConnect();
}
