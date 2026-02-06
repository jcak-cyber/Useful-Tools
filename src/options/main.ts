import { createApp } from "vue";
import "./style.scss";
import App from "./App.vue";
import { createPiniaPlugin } from "../stores/index";

// 声明全局变量
declare global {
  const __HMR_ENABLED__: boolean;
}

let app: ReturnType<typeof createApp> | null = null;

const initApp = () => {
  if (app) {
    app.unmount();
  }

  app = createApp(App);
  createPiniaPlugin(app);
  app.mount("#app_options_page");
};

initApp();
