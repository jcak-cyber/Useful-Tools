<template>
  <div class="layout-container" v-if="showBlurBox">
    <div class="blur-box" />
    <div class="tip-box">暂时离开一下，稍后就回来...</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { useKeyPress } from "../../hooks/useKeyPress";

const showBlurBox = ref(false);
const { bindKeyPress, removeKeyPress } = useKeyPress(() => {
  showBlurBox.value = !showBlurBox.value;
});

onMounted(() => {
  bindKeyPress();
});

onUnmounted(() => {
  removeKeyPress();
});

chrome.runtime.onMessage.addListener((message: Tools.MessageBody) => {
  console.log("content script received message:", message);
  const { action, data } = message;

  if (action === "TO_CONTENT_SCRIPT") {
    const { value } = data;
    showBlurBox.value = value;
  }

  return false;
});
</script>

<style lang="scss" scoped>
@use "./index.scss";
</style>
