<template>
  <n-config-provider :theme="lightTheme">
    <Layout />
  </n-config-provider>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { NConfigProvider, lightTheme } from "naive-ui";
import Layout from "./components/Layout.vue";
import { MESSAGE_ACTIONS } from "../constants";
import { logger } from "../utils/logger";

onMounted(() => {
  chrome.runtime.sendMessage(
    { action: MESSAGE_ACTIONS.POPUP_OPENED },
    (response) => {
      if (chrome.runtime.lastError) {
        logger.error("发送消息失败:", chrome.runtime.lastError);
      } else {
        logger.log("Popup 打开消息已发送");
      }
    }
  );
});
</script>

<style lang="scss" scoped></style>
