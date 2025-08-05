<template>
  <div class="tools-menu">
    <div class="tools-menu-item" v-for="item in toolsMenuList" :key="item.key">
      <div class="tools-menu-item-top">
        <div class="tools-menu-item-label">{{ item.label }}</div>
        <NSwitch
          v-model:value="item.value"
          @update:value="(e:boolean)=>handleSwitchChange(e,item.key)"
        />
      </div>
      <div class="tools-menu-item-bottom"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NSwitch } from "naive-ui";
import { ref, onMounted } from "vue";
import { getStorageByPopup } from "../../../utils/customLocalStorage";

const toolsMenuList = ref<Popup.ToolsMenu[]>([
  {
    label: "离开一下",
    key: "rest",
    value: false,
  },
]);

onMounted(async () => {
  const toolsData: Tools.ToolsData =
    (await getStorageByPopup("toolsData")) || {};

  if (toolsData["rest"]) {
    toolsMenuList.value = toolsMenuList.value.map((item) => {
      return { ...item, value: toolsData.rest || item.value };
    });
  }
  console.log("toolsData", toolsData);
});

const handleSwitchChange = async (value: boolean, key: string) => {
  switch (key) {
    case "rest":
      // 获取当前活动标签页
      chrome.tabs.query(
        {
          active: true,
          currentWindow: true,
        },
        (tabs) => {
          if (tabs[0] && tabs[0].id) {
            console.log("Sending message to tab:", tabs[0].id);

            chrome.tabs.sendMessage(tabs[0].id, {
              action: "TO_CONTENT_SCRIPT",
              data: { key, value },
            });
          } else {
            console.error("No active tab found");
          }
        }
      );
      break;

    default:
      console.log("Unknown tool key:", key);
      break;
  }
};
</script>

<style lang="scss" scoped>
@use "./index.scss";
</style>
