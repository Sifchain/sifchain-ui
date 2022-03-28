// An alternative setup to vuex

import { createApp, defineComponent, reactive } from "vue";
import { Network } from "../../../core/src";
import App from "../App.vue";

interface Store<State> {
  state: State;
}
export const state = () => ({
  wallets: reactive<Record<Network, { thing?: string }>>({
    sifchain: {
      thing: "sifchain",
    },
    cosmoshub: {},
    ethereum: {},
  }),
});
type State = ReturnType<typeof state>;

const stores: Record<string, Store<State>> = {};
const key = "store";
export const RootStore = defineComponent<{}, {}, State>({
  setup: state,
  render() {
    stores[key] = {
      state: this.$data,
    };
    return <App />;
  },
});
const instance = createApp(RootStore);
export const Root = () => instance;
export const useStore = () => {
  return stores[key];
};
