import { navBar } from "./pages/components/NavBar";
import { metamaskConnectPage } from "./pages/MetamaskConnectPage";
import { keplrNotificationPopup } from "./pages/KeplrNotificationPopup";
import { metamaskPage } from "./pages/MetaMaskPage";
import { keplrPage } from "./pages/KeplrPage";
import { balancesPage } from "./pages/BalancesPage";
import urls from "./data/urls.json";
import { waitUntil } from "./utils";
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

  // todo: refactor these 3 lines below
  await keplrNotificationPopup.navigate(
    urls.keplr.notificationPopup.signinApprove,
  ); // Sentinelhub approval notification
  await waitUntil(() => prepareKeplrApproveNotification(), 30000, 3000);
  await keplrNotificationPopup.clickApprove();

  await page.bringToFront();
  await navBar.clickConnectWallets();

  await connectMetaMaskAccount();
  await context.waitForEvent("page");
  await connectKeplrAccount();
}

// export async function resetExtensionsConnection() {
//   page = await context.newPage(); // TODO: move it to global setup
//   await balancesPage.navigate();

//   await reconnectKeplrAccount();

//   await metamaskPage.reset();
//   await page.bringToFront();
// }

export async function connectKeplrAccount() {
  // open question: WHY sifchain approval pops up automatically and other IBC connections
  // need to be made through 'Connect' button (apart from Sentinel connection that comes very first)?
  await approveConnection("sifchain");

  await navBar.clickConnectWallets();
  await walletConnect.clickConnect("Cosmoshub");
  await context.waitForEvent("page");
  await approveConnection("cosmoshub");
}

export async function approveConnection(networkName) {
  await keplrNotificationPopup.navigate(urls.keplr.notificationPopup.connect);
  await keplrNotificationPopup.verifyNetworkName(networkName);
  await waitUntil(() => prepareKeplrApproveNotification(), 30000, 3000); // uncomment me
  await keplrNotificationPopup.clickApprove();
  // new page opens
  await context.waitForEvent("page");

  await keplrNotificationPopup.navigate(
    urls.keplr.notificationPopup.signinApprove,
  );
  await keplrNotificationPopup.verifyNetworkName(networkName);
  await keplrNotificationPopup.clickApprove();
}

// export async function reconnectKeplrAccount() {
//   await navBar.clickConnectWallets();
//   const isConnected = await connectPopup.isKeplrConnected();
//   if (!isConnected) await connectPopup.clickConnectKeplr();
// }

export async function connectMetaMaskAccount() {
  await walletConnect.clickConnect("Metamask");

  await context.waitForEvent("page");
  await page.waitForTimeout(2000); // TODO: replace explicit wait with dynamic waiting for new page (which happens line above but is a bit flaky)

  await metamaskConnectPage.navigate();
  await metamaskConnectPage.clickNext();
  await metamaskConnectPage.clickConnect();
}
