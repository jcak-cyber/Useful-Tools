<template>
  <n-message-provider>
    <Loading />
    <div class="layout">
      <ToolsMenu />
    </div>
  </n-message-provider>
</template>

<script setup lang="ts">
import { NMessageProvider } from "naive-ui";
import Loading from "../../hooks/useLoading";
import ToolsMenu from "./ToolsMenu/index.vue";
</script>

<style lang="scss" scoped>
.layout {
  width: 250px;
  padding: 16px;
}
</style>
