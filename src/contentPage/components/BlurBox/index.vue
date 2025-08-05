<template>
  <div class="blur-container" v-if="showBlurBox">
    <div class="blur-box" />
    <div class="tip-box">暂时离开一下，稍后就回来...</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, defineExpose } from "vue";
import { useKeyPress } from "../../../hooks/useKeyPress";
import { getStorage, setStorage } from "../../../utils/customLocalStorage";

const showBlurBox = ref(false);
const toolsData: Tools.ToolsData = getStorage("toolsData") || {};

const { bindKeyPress, removeKeyPress } = useKeyPress(() => {
  showBlurBox.value = !showBlurBox.value;
  toolsData["rest"] = showBlurBox.value;
  setStorage("toolsData", toolsData);
});

onMounted(() => {
  bindKeyPress();
  showBlurBox.value = toolsData["rest"] || false;
});

onUnmounted(() => {
  removeKeyPress();
});

const setVisible = (value: boolean) => {
  showBlurBox.value = value;
};

defineExpose({ setVisible });
</script>

<style lang="scss" scoped>
@use "./index.scss";
</style>
