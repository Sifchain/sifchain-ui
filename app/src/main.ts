import { createApp } from "vue";
import { VueQueryPlugin, VueQueryPluginOptions } from "vue-query";
import loadAnalytics from "./analytics/loader";
import App from "./App";
import router from "./router";
import "./scss/index.css";
import { vuexStore } from "./store/index";

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

app.use(VueQueryPlugin, {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        staleTime: 10000,
        refetchOnWindowFocus: false,
      },
    },
  },
} as VueQueryPluginOptions);

app.use(vuexStore);
app.use(router).mount("#app");

loadAnalytics().then((loaded) => {
  if (loaded) {
    console.log("Analytics loaded");
  } else {
    console.log("Analytics not enabled for the current domain");
  }
});
