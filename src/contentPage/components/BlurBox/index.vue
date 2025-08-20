<template>
  <div class="blur-container" v-if="showBlurBox" ref="blurContainer">
    <div class="blur-box" />
    <div class="blur-tip-box">
      <div class="blur-line">暂时离开一下，稍后就回来...</div>
      <div class="blur-line">急事请电话联系:13698161685</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, defineExpose } from "vue";
import { useEventListener } from "../../../hooks/useEventListener";
import { getStorage, setStorage } from "../../../utils/customLocalStorage";
const blurContainer = ref<HTMLDivElement>();
const showBlurBox = ref(false);
const toolsData: Tools.ToolsData = getStorage("toolsData") || {};

const { bindListener: bindKeyPress } = useEventListener<KeyboardEvent>(
  "keydown",
  (event) => {
    if (event.ctrlKey && event.altKey && event.key === "b") {
      showBlurBox.value = !showBlurBox.value;
      toolsData["rest"] = showBlurBox.value;
      setStorage("toolsData", toolsData);
    }
  }
);

onMounted(() => {
  bindKeyPress();
  showBlurBox.value = toolsData["rest"] || false;
});

const setVisible = (value: boolean) => {
  showBlurBox.value = value;
};

defineExpose({ setVisible });
</script>

<style lang="scss" scoped>
@use "./index.scss";
</style>
