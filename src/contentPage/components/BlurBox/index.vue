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
import { STORAGE_KEYS, SHORTCUT_KEYS } from "../../../constants";
import { logger } from "../../../utils/logger";

const blurContainer = ref<HTMLDivElement>();
const showBlurBox = ref(false);
const toolsData =
  getStorage<Tools.ToolsData>(STORAGE_KEYS.TOOLS_DATA) ||
  ({} as Tools.ToolsData);

/**
 * 处理快捷键切换模糊框显示状态
 */
const handleKeyPress = (event: KeyboardEvent) => {
  const { ctrl, alt, key } = SHORTCUT_KEYS.TOGGLE_BLUR;

  if (event.ctrlKey === ctrl && event.altKey === alt && event.key === key) {
    event.preventDefault();
    showBlurBox.value = !showBlurBox.value;
    toolsData.rest = showBlurBox.value;
    setStorage(STORAGE_KEYS.TOOLS_DATA, toolsData);
    logger.log(`模糊框状态已切换为: ${showBlurBox.value}`);
  }
};

const { bindListener: bindKeyPress } = useEventListener<KeyboardEvent>(
  "keydown",
  handleKeyPress
);

onMounted(() => {
  bindKeyPress();
  showBlurBox.value = toolsData.rest || false;
});

/**
 * 设置模糊框可见性
 * @param value - 是否显示
 */
const setVisible = (value: boolean) => {
  showBlurBox.value = value;
};

defineExpose({ setVisible });
</script>

<style lang="scss" scoped>
@use "./index.scss";
</style>
