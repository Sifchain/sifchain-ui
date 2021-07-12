import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./scss/index.css";
const app = createApp(App);

if (process.env.NODE_ENV === "development") {
  app.config.performance = true;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  app.config.devtools = true;
}

app.use(router).mount("#app");
