import { createPinia, type Pinia } from "pinia";
import type { App } from "vue";

let pinia: Pinia;

// 构建pinia插件
export function createPiniaPlugin(app: App<Element>) {
  pinia = createPinia();
  app.use(pinia);
}

export { pinia };
