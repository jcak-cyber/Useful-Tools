<template>
  <div class="layout-container">
    <BlurBox ref="blurBox" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import BlurBox from "../BlurBox/index.vue";
import { getStorage, setStorage } from "../../../utils/customLocalStorage";

const blurBox = ref<InstanceType<typeof BlurBox>>();

chrome.runtime.onMessage.addListener((message: Tools.MessageBody) => {
  console.log("content script received message:", message);
  const { action, data } = message;

  const toolsData: Tools.ToolsData = getStorage("toolsData") || {};

  if (action === "TO_CONTENT_SCRIPT") {
    const { value, key } = data;
    switch (key) {
      case "rest":
        toolsData[key] = value;

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
