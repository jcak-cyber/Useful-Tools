import { defineStore } from "pinia";
import { ref } from "vue";

/**
 * 全局状态管理 Store
 */
export const useGlobalStore = defineStore("global", () => {
  /** 是否允许编辑 storage */
  const canEditStorage = ref<boolean>(false);

  /**
   * 设置是否允许编辑 storage
   * @param payload - 是否允许编辑
   */
  const setCanEditStorage = (payload: boolean) => {
    canEditStorage.value = payload;
  };

  return {
    canEditStorage,
    setCanEditStorage,
  };
});
