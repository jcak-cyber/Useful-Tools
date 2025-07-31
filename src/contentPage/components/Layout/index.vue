<template>
  <div class="layout-container" v-if="showBlurBox">
    <div class="blur-box" />
    <div class="tip-box">暂时离开一下，稍后就回来...</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRootNode } from "../../hooks/useRootNode";

const showBlurBox = ref(false);
const rootNode = useRootNode();

chrome.runtime.onMessage.addListener((message: Tools.MessageBody) => {
  console.log("content script received message:", message);
  const { action, data } = message;

  if (action === "TO_CONTENT_SCRIPT") {
    const { value } = data;
    showBlurBox.value = value;
    console.log(rootNode);
  }

  return false;
});
</script>

<style lang="scss" scoped>
@use "./index.scss";
</style>
