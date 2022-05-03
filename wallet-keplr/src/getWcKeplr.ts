import { Keplr } from "@keplr-wallet/types";
import { KeplrWalletConnectV1 } from "@keplr-wallet/wc-client";
import { KeplrQRCodeModalV1 } from "@keplr-wallet/wc-qrcode-modal";
import WalletConnect from "@walletconnect/client";

export const getWalletConnect = () =>
  new WalletConnect({
    bridge: "https://bridge.walletconnect.org",
    signingMethods: [
      "keplr_enable_wallet_connect_v1",
      "keplr_sign_amino_wallet_connect_v1",
    ],
    qrcodeModal: new KeplrQRCodeModalV1(),
  });

export function getWCKeplr(
  options: ConstructorParameters<typeof KeplrWalletConnectV1>["1"],
): Promise<Keplr> {
  const connector = getWalletConnect();

  if (connector.connected) {
    return Promise.resolve(new KeplrWalletConnectV1(connector, options));
  }

  connector.createSession();

  return new Promise<Keplr>((resolve, reject) => {
    connector.on("connect", (error) => {
      if (error) {
        reject(error);
      } else {
        resolve(new KeplrWalletConnectV1(connector, options));
      }
    });
  });
}
