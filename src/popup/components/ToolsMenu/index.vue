<template>
  <div class="container">
    <!-- <div class="settings">
      <Settings class="settings-icon" @click="handleOpenSettingPage" />
    </div> -->
    <div class="tools-menu">
      <div class="tools-menu-item" v-for="item in toolsMenuList" :key="item.key">
        <div class="tools-menu-item-top">
          <div class="tools-menu-item-label">{{ item.label }}</div>
          <NSwitch v-model:value="item.value" @update:value="(e: boolean) => handleSwitchChange(e, item.key)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NSwitch } from "naive-ui";
import { ref, onMounted } from "vue";
import { getStorageByPopup } from "../../../utils/customLocalStorage";
import { STORAGE_KEYS, MESSAGE_ACTIONS } from "../../../constants";
import { logger } from "../../../utils/logger";
// import { Settings } from "@vicons/ionicons5"

const toolsMenuList = ref<Popup.ToolsMenu[]>([
  {
    label: "离开一下 (ctrl+alt+b)",
    key: "rest",
    value: false,
  },
  {
    label: "计算器 (ctrl+alt+c)",
    key: "calculator",
    value: false,
  },
  {
    label: "颜色提取器 (ctrl+alt+p)",
    key: "colorPicker",
    value: false,
  },
]);

onMounted(async () => {
  try {
    const toolsData = (await getStorageByPopup<Tools.ToolsData>(
      STORAGE_KEYS.TOOLS_DATA
    )) || {};

    if (toolsData.rest !== undefined) {
      toolsMenuList.value = toolsMenuList.value.map((item) => {
        if (item.key === "rest") {
          return { ...item, value: toolsData.rest || false };
        }
        return item;
      });
    }

    if (toolsData.calculator !== undefined) {
      toolsMenuList.value = toolsMenuList.value.map((item) => {
        if (item.key === "calculator") {
          return { ...item, value: toolsData.calculator || false };
        }
        return item;
      });
    }

    if (toolsData.colorPicker !== undefined) {
      toolsMenuList.value = toolsMenuList.value.map((item) => {
        if (item.key === "colorPicker") {
          return { ...item, value: toolsData.colorPicker || false };
        }
        return item;
      });
    }
    logger.log("工具数据加载完成", toolsData);
  } catch (error) {
    logger.error("加载工具数据失败:", error);
  }
});

/**
 * 处理开关变化
 */
const handleSwitchChange = async (value: boolean, key: string) => {
  try {
    switch (key) {
      case "rest":
      case "calculator":
      case "colorPicker":
        // 获取当前活动标签页
        chrome.tabs.query(
          {
            active: true,
            currentWindow: true,
          },
          (tabs) => {
            const tab = tabs[0];
            if (!tab?.id) {
              logger.error("未找到活动标签页");
              return;
            }

            logger.log(`向标签页 ${tab.id} 发送消息`);

            chrome.tabs.sendMessage(
              tab.id,
              {
                action: MESSAGE_ACTIONS.TO_CONTENT_SCRIPT,
                data: { key, value },
              }
            );
          }
        );
        break;

      default:
        logger.warn(`未知的工具键: ${key}`);
        break;
    }
  } catch (error) {
    logger.error("处理开关变化时发生错误:", error);
  }
};

// const handleOpenSettingPage = () => {
//   chrome.tabs.create({ url: "options.html" });
// }
</script>

<style lang="scss" scoped>
@use "./index.scss";
</style>
