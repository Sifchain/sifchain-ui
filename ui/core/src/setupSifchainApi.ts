import { createUsecases } from ".";
import { createApi } from "./api";
import { getConfig } from "./config/getConfig";
import { profileLookup, SifEnv } from "./config/getEnv";
import { createServices } from "./services";
import { createStore } from "./store";

export type ApplicationNetworkEnvironment =
  | "localnet"
  | "devnet"
  | "testnet"
  | "mainnet";

export function setupSifchainApi(
  environment: ApplicationNetworkEnvironment = "localnet",
) {
  // Following should happen with an underlying shared API
  const { tag, ethAssetTag, sifAssetTag } = profileLookup[
    {
      devnet: SifEnv.DEVNET,
      localnet: SifEnv.LOCALNET,
      testnet: SifEnv.TESTNET,
      mainnet: SifEnv.MAINNET,
    }[environment]
  ];

  const config = getConfig(tag, sifAssetTag, ethAssetTag);
  const services = createServices(config);
  const store = createStore();
  const usecases = createUsecases({ store, services });
  const api = createApi(usecases, services);

  const unsubscribers: (() => void)[] = [];
  unsubscribers.push(usecases.clp.initClp());
  unsubscribers.push(usecases.wallet.sif.initSifWallet());
  unsubscribers.push(usecases.wallet.eth.initEthWallet());

  function cleanup() {
    for (let unsubscriber of unsubscribers) {
      unsubscriber();
    }
  }
  return { api, services, store, cleanup };
}
