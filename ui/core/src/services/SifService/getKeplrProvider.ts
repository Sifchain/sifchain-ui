import { OfflineSigner } from "@cosmjs/launchpad";
import { sleep } from "../../test/utils/sleep";
import { Keplr } from "@keplr-wallet/types";

type WindowWithPossibleKeplr = typeof window & {
  keplr?: Keplr;
  getOfflineSigner?: any;
};

type provider = Keplr;
let numChecks = 0;

// Detect mossible keplr provider from browser
export default async function getKeplrProvider(): Promise<provider | null> {
  if (typeof window === "undefined") return null;

  const win = window as WindowWithPossibleKeplr;

  if (!win) return null;

  if (!win.keplr || !win.getOfflineSigner) {
    numChecks++;
    if (numChecks > 20) {
      return null;
    }
    await sleep(100);
    return getKeplrProvider();
  }

  console.log("Keplr wallet bootstraped");
  return win.keplr as Keplr;
}
