import { createUsecases } from ".";
import { createApi } from "./api";
import { getConfig } from "./config/getConfig";
import { NetworkEnv, profileLookup } from "./config/getEnv";
import { createServices } from "./services";
import { createStore } from "./store";

// export type SifchainEnv =
//   | "mainnet"
//   | "testnet"
//   | "devnet"
//   | "localnet"
//   | "devnet_042";

export function setupSifchainApi(
  environment: NetworkEnv = NetworkEnv.LOCALNET,
) {
  // Following should happen with an underlying shared API
  const { tag, ethAssetTag, sifAssetTag } = profileLookup[environment];
  if (typeof tag == "undefined")
    throw new Error("environment " + environment + " not found");
  const config = getConfig(tag, sifAssetTag, ethAssetTag);
  const services = createServices(config);
  const store = createStore();
  const usecases = createUsecases({ store, services });
  const api = createApi(usecases, services);

  const unsubscribers: (() => void)[] = [];
  unsubscribers.push(usecases.wallet.sif.initSifWallet());
  unsubscribers.push(usecases.wallet.eth.initEthWallet());

  function cleanup() {
    for (let unsubscriber of unsubscribers) {
      unsubscriber();
    }
  }
  return { api, services, store, cleanup, config };
}
