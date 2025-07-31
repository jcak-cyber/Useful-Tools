<template>
  <n-config-provider :theme="lightTheme">
    <Layout />
  </n-config-provider>
</template>

<script setup lang="ts">
import { NConfigProvider } from "naive-ui";
import { lightTheme } from "naive-ui";

import Layout from "./components/Layout/index.vue";
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100vh;
  background-color: #fff;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 3000;
  filter: blur(10px);
}
</style>
