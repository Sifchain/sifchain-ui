import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./scss/index.css";
import { rootStore, vuexStore } from "./store/index";

import "@sifchain/sdk/src/config/assets/loader";

const app = createApp(App);

// Vue spams us with prop-type warnings.. unnecessary
app.config.warnHandler = (msg: string, vm: any, trace: any) => {
  if (/Invalid prop:/.test(msg)) return;
  return console.warn(msg, trace);
};

if (process.env.NODE_ENV === "development") {
  app.config.performance = true;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  app.config.devtools = true;
}
console.log(
  import.meta.env.VITE_APP_DEPLOYMENT,
  import.meta.env.VITE_APP_VERSION,
  import.meta.env.VITE_APP_SHA,
);

app.use(vuexStore);
app.use(router).mount("#app");
