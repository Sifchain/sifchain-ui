import { accountStore } from "./modules/accounts";
import { importStore } from "./modules/import";

export const rootStore = {
  accounts: accountStore,
  import: importStore,
};
