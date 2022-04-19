import { Store } from "vuex";
import { rootStore, StoreState } from "./store";

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $store: Store<StoreState>;
  }
}
