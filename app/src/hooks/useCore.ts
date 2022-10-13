import { createServices, createUsecases } from "~/business";
import { Asset, getConfig, getEnv, switchEnv } from "@sifchain/sdk";
import {
  createAccountPoolFinder,
  createPoolFinder,
  createStore,
} from "~/business/store";

switchEnv({ location: window.location });

const { tag, sifAssetTag, ethAssetTag } = getEnv({
  location: window.location,
});
console.log("getEnv", { tag, sifAssetTag, ethAssetTag });
const config = getConfig(tag, sifAssetTag, ethAssetTag);

console.log("config", { config });
const services = createServices(config);
const store = createStore();
const usecases = createUsecases({ store, services });
const poolFinder = createPoolFinder(store);
const accountPoolFinder = createAccountPoolFinder(store);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window["config"] = config;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window["services"] = services;
// expose store on window so it is easy to inspect
Object.defineProperty(window, "store", {
  get: function () {
    // Gives us `store` for in console inspection
    // Gives us `store.dump()` for string representation
    // Gives us `store.dumpTab()` for string representation
    const storeString = JSON.stringify(
      store,
      (_, value) => {
        // TODO give all entities a toString so we don't have to do this
        // if AssetAmount
        if (value?.asset && value?.quotient) {
          return value.toString();
        }

        // If Fraction
        if (value?.numerator && value?.denominator) {
          return value.toFixed(18);
        }

        return value;
      },
      2,
    );

    const storeSafe = JSON.parse(storeString);
    storeSafe.dumpTab = () => {
      const x = window.open();
      x?.document.open();
      x?.document.write("<pre>" + storeString + "</pre>");
      x?.document.close();
    };
    storeSafe.dump = () => {
      return storeString;
    };

    return storeSafe;
  },
});

// hack to cache the assets
// TODO: this is a very poor pattern
// need to do caching at network layer
config.assets.forEach((x) => Asset.set(x.symbol, x));

export function useCore() {
  return {
    store,
    services,
    usecases,
    poolFinder,
    accountPoolFinder,
    config,
  };
}
