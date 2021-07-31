import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./scss/index.css";
import { rootStore } from "./store/index";

const app = createApp(App);

if (process.env.NODE_ENV === "development") {
  app.config.performance = true;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  app.config.devtools = true;
}
Object.values(rootStore).forEach((mod) => {
  app.use(mod.store);
});
app.use(router).mount("#app");
