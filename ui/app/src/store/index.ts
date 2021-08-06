import { accountStore } from "./modules/accounts";
import { importStore } from "./modules/import";
import { createStore } from "vuex";
import { exportStore } from "./modules/export";

export const vuexStore = createStore({
  devtools: true,
});
accountStore.register(vuexStore);
importStore.register(vuexStore);
exportStore.register(vuexStore);
export const rootStore = {
  accounts: accountStore,
  import: importStore,
  export: exportStore,
};
