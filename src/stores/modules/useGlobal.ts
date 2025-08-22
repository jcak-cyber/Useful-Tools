import { defineStore } from "pinia";
import { ref } from "vue";

export const useGlobalStore = defineStore("test", () => {
  const canEditStorage = ref<boolean>(false);

  const setCanEditStorage = (payload: boolean) => {
    canEditStorage.value = payload;
  };

  return { canEditStorage, setCanEditStorage };
});
