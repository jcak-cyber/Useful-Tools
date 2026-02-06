<template>
  <n-config-provider :theme="lightTheme">
    <Layout />
  </n-config-provider>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { NConfigProvider, lightTheme } from "naive-ui";
import Layout from "./components/Layout.vue";

onMounted(() => {
  console.log("options page mounted");

});
</script>

<style lang="scss" scoped></style>
