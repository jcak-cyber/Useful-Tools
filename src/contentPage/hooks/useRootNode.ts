import { getCurrentInstance, type AppContext } from "vue";

export const useRootNode = (): HTMLElement | null => {
  const app = getCurrentInstance();
  console.log(app);
  // 修复类型断言和可选链的用法
  const container = (
    app?.root?.appContext as AppContext & { _container?: HTMLElement }
  )?._container;
  return container ?? null;
};
