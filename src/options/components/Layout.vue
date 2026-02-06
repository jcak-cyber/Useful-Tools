<template>
  <n-message-provider>
    <Loading />
    <div class="layout">
      123
    </div>
  </n-message-provider>
</template>

<script setup lang="ts">
import { NMessageProvider } from "naive-ui";
import Loading from "../../hooks/useLoading";

</script>

<style lang="scss" scoped>
.layout {
  width: 100%;
  height: 100%;
}
</style>
