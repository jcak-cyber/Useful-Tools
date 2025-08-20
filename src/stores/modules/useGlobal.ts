import { defineStore } from "pinia";
import { ref } from "vue";

// 这只是一个测试例子，请改成你自己的文件存储逻辑
export const useGlobalStore = defineStore("test", () => {
  const canEditStorage = ref<boolean>(false);

  const setCanEditStorage = (payload: boolean) => {
    canEditStorage.value = payload;
  };

  return { canEditStorage, setCanEditStorage };
});
