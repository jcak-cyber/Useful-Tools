import { createPinia } from "pinia";
import type { App } from "vue";

// 构建pinia插件
export function createPiniaPlugin(app: App<Element>) {
  const pinia = createPinia();
  app.use(pinia);
}
