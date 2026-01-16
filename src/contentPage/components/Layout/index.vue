<template>
  <div class="layout-container">
    <BlurBox ref="blurBox" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import _ from "lodash-es";
import BlurBox from "../BlurBox/index.vue";
import {
  getStorage,
  setStorage,
  storageListener,
} from "../../../utils/customLocalStorage";
import { useGlobalStore } from "../../../stores/index";
import {
  STORAGE_KEYS,
  MESSAGE_ACTIONS,
  DEFAULT_CONFIG,
} from "../../../constants";
import { logger } from "../../../utils/logger";

const blurBox = ref<InstanceType<typeof BlurBox>>();
const oldStorage = ref<Tools.ToolsData>();
const globalStore = useGlobalStore();

/**
 * 处理 storage 变化
 */
const handleStorageChange = (value: Tools.ToolsData | null) => {
  const currentValue = value || {};
  const isEqual = _.isEqual(currentValue, oldStorage.value);

  // 如果值没有变化，不处理
  if (isEqual) {
    return false;
  }

  // 非法修改：还原到旧值
  if (!globalStore.canEditStorage) {
    logger.warn("检测到非法修改 storage，正在还原");
    setStorage(STORAGE_KEYS.TOOLS_DATA, oldStorage.value, false);
    return false;
  }

  // 正常修改：更新旧值并重置编辑标志
  logger.log("正常修改 storage，执行中");
  oldStorage.value = currentValue;
  globalStore.setCanEditStorage(false);
  return false;
};

const { start, stop } = storageListener<Tools.ToolsData>(
  STORAGE_KEYS.TOOLS_DATA,
  DEFAULT_CONFIG.STORAGE_LISTENER_DELAY,
  handleStorageChange
);

/**
 * 处理来自 background 或 popup 的消息
 */
const handleMessage = (
  message: Tools.MessageBody,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
): boolean => {
  logger.log("Content script received message:", message);
  const { action, data } = message;

  if (action !== MESSAGE_ACTIONS.TO_CONTENT_SCRIPT) {
    return false;
  }

  try {
    const toolsData: Tools.ToolsData =
      getStorage<Tools.ToolsData>(STORAGE_KEYS.TOOLS_DATA) || {};

    const { value, key } = data;

    switch (key) {
      case "rest":
        toolsData[key] = value;
        blurBox.value?.setVisible(value);
        setStorage(STORAGE_KEYS.TOOLS_DATA, toolsData);
        break;

      default:
        logger.warn(`未知的消息键: ${key}`);
        break;
    }

    sendResponse({ success: true });
  } catch (error) {
    logger.error("处理消息时发生错误:", error);
    sendResponse({ success: false, error: String(error) });
  }

  return false; // 异步响应
};

onMounted(() => {
  start();
  oldStorage.value = getStorage<Tools.ToolsData>(STORAGE_KEYS.TOOLS_DATA) || {};
  chrome.runtime.onMessage.addListener(handleMessage);
});

onUnmounted(() => {
  stop();
  chrome.runtime.onMessage.removeListener(handleMessage);
});
</script>

<style lang="scss" scoped>
@use "./index.scss";
</style>
