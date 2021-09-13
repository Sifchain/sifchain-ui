import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./scss/index.css";
import { rootStore, vuexStore } from "./store/index";
// import * as Sentry from "@sentry/vue";
// import { Integrations } from "@sentry/tracing";

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

if (
  location.hostname === "testnet.sifchain.finance" ||
  location.hostname === "dex.sifchain.finance"
) {
  Sentry.init({
    app,
    environment:
      location.hostname === "testnet.sifchain.finance"
        ? "staging"
        : "production",
    dsn:
      "https://eecc7e44157b4ad4be9403adfbc42430@o987802.ingest.sentry.io/5944846",
    integrations: [
      new Integrations.BrowserTracing({
        routingInstrumentation: Sentry.vueRouterInstrumentation(router),
        tracingOrigins: ["localhost", /^rpc.sifchain/, /api-int.sifchain/],
      }),
    ],
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 0.1,
  });
}
