<template>
  <div class="blur-container" v-if="showBlurBox" ref="blurContainer">
    <div class="blur-box" />
    <div class="tip-box">
      <div class="line">暂时离开一下，稍后就回来...</div>
      <div class="line">急事请电话联系:13698161685</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, defineExpose, watch } from "vue";
import { useKeyPress } from "../../../hooks/useKeyPress";
import { getStorage, setStorage } from "../../../utils/customLocalStorage";

const timer = ref<number>();
const blurContainer = ref<HTMLDivElement>();
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
