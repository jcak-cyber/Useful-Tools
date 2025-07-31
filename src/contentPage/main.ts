import { createApp } from "vue";
import App from "./App.vue";
import "./style.scss";

// 直接创建并挂载 Vue 应用，不导出任何内容
export const createVueApp = (id: string) => {
  const app = createApp(App);
  app.mount(`#${id}`);
};
