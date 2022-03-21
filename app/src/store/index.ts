import { accountStore } from "./modules/accounts";
import { importStore } from "./modules/import";
import { createStore } from "vuex";
import { exportStore } from "./modules/export";
import { flagsStore } from "./modules/flags";
import { governanceStore } from "./modules/governance";

export const vuexStore = createStore({
  devtools: true,
});
accountStore.register(vuexStore);
importStore.register(vuexStore);
exportStore.register(vuexStore);
flagsStore.register(vuexStore);
governanceStore.register(vuexStore);
export const rootStore = {
  accounts: accountStore,
  import: importStore,
  export: exportStore,
  flags: flagsStore,
  governance: governanceStore,
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.rootStore = rootStore;
