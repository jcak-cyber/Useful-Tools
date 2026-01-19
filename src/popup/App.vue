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

onMounted(() => {
  chrome.runtime.sendMessage(
    { action: MESSAGE_ACTIONS.POPUP_OPENED },
    
  );
});
</script>

<style lang="scss" scoped></style>
