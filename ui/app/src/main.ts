import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./scss/index.css";
import { rootStore, vuexStore } from "./store/index";

const app = createApp(App);

const warnings: string[] = ((window as any).warnings = []);
// Vue spams us with warnings.. typescript handles them for us though.
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
console.log(process.env.VUE_APP_VERSION, process.env.VUE_APP_SHA);

app.use(vuexStore);
app.use(router).mount("#app");
