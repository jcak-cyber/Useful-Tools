<template>
  <div class="layout-container">
    <BlurBox ref="blurBox" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

import BlurBox from "../BlurBox/index.vue";
import {
  getStorage,
  setStorage,
  storageListener,
} from "../../../utils/customLocalStorage";
import _ from "lodash-es";
import { useGlobalStore } from "../../../stores/index";

const blurBox = ref<InstanceType<typeof BlurBox>>();
const oldStorage = ref<Tools.ToolsData>();
const globalStore = useGlobalStore();

const { start, stop } = storageListener<Tools.ToolsData>(
  "toolsData",
  400,
  (value) => {
    if (!globalStore.canEditStorage && !_.isEqual(value, oldStorage.value)) {
      console.log("非法修改storage,正在还原");
      setStorage("toolsData", oldStorage.value);
    }
    if (globalStore.canEditStorage && !_.isEqual(value, oldStorage.value)) {
      console.log("正常修改storage,执行中");

      oldStorage.value = value;
      globalStore.setCanEditStorage(false);
    }
    return false;
  }
);

onMounted(() => {
  start();
  oldStorage.value = getStorage("toolsData") || {};
});

onUnmounted(() => {
  stop();
});

chrome.runtime.onMessage.addListener((message: Tools.MessageBody) => {
  console.log("content script received message:", message);
  const { action, data } = message;

  const toolsData: Tools.ToolsData = getStorage("toolsData") || {};

  if (action === "TO_CONTENT_SCRIPT") {
    const { value, key } = data;
    switch (key) {
      case "rest":
        toolsData[key] = value;
        globalStore.setCanEditStorage(true);
        blurBox.value?.setVisible(value);

        break;

      default:
        break;
    }

    setStorage("toolsData", toolsData);
  }

  return false;
});
</script>

<style lang="scss" scoped>
@use "./index.scss";
</style>
