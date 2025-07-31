import { createApp } from "vue";
import "./style.scss";
import App from "./App.vue";
import createPiniaPlugin from "../stores/deploy/createPinia";
import { createHMRManager } from "../utils/hrmEvent";

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
  app.mount("#app");
};

initApp();

// 使用全局变量确保热更新代码在生产环境被完全排除
// if (import.meta.env.MODE === "development") {
//   const { connect } = createHMRManager(initApp);
//   connect();
// } else {
//   initApp();
// }
