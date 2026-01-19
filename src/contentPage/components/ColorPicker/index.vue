<template>
  <div v-if="visible" class="color-picker-overlay" @mousemove="handleMouseMove" @click="handleClick">
    <!-- 截图 Canvas，视觉隐藏但用于取色 -->
    <canvas ref="screenshotCanvas" class="screenshot-canvas"></canvas>

    <template v-if="!loading">
      <!-- 放大镜光标 -->
      <div class="magnifier-cursor" :style="{
        left: position.x + 'px',
        top: position.y + 'px',
        borderColor: currentColor.hex
      }">
        <canvas ref="magnifierCanvas" width="100" height="100" class="magnifier-canvas"></canvas>
        <div class="crosshair"></div>
      </div>

      <!-- 颜色信息面板 -->
      <div class="color-info-panel" :style="{
        left: position.x + 60 + 'px',
        top: position.y + 60 + 'px'
      }">
        <div class="info-row">
          <span class="label">HEX</span>
          <span class="value">{{ currentColor.hex }}</span>
        </div>
        <div class="info-row">
          <span class="label">RGB</span>
          <span class="value">{{ currentColor.rgb }}</span>
        </div>
        <div class="hint-text">点击复制 | ESC 关闭</div>
      </div>
    </template>

    <!-- 全局提示消息 -->
    <div v-if="message" class="toast-message">{{ message }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { getStorage, setStorage } from "../../../utils/customLocalStorage";
import { STORAGE_KEYS, MESSAGE_ACTIONS, SHORTCUT_KEYS } from "../../../constants";
import { logger } from "../../../utils";
import { useEventListener } from "../../../hooks/useEventListener";

const visible = ref(false);
const loading = ref(true);
const position = ref({ x: 0, y: 0 });
const message = ref("");
const screenshotCanvas = ref<HTMLCanvasElement>();
const magnifierCanvas = ref<HTMLCanvasElement>();
let messageTimer: any = null;
let ctx: CanvasRenderingContext2D | null = null;
let magnifierCtx: CanvasRenderingContext2D | null = null;
let originalOverflow = "";

// 颜色状态
const currentColor = ref({
  hex: "#FFFFFF",
  rgb: "255, 255, 255",
  rgba: "rgba(255, 255, 255, 1)",
  r: 255,
  g: 255,
  b: 255,
});

const handleKeyPress = (event: KeyboardEvent) => {
  const { ctrl, alt, key } = SHORTCUT_KEYS.TOGGLE_COLOR_PICKER;

  if (event.ctrlKey === ctrl && event.altKey === alt && event.key === key) {
    const toolsData = getStorage<Tools.ToolsData>(STORAGE_KEYS.TOOLS_DATA) || {};

    event.preventDefault();
    visible.value = !visible.value;
    toolsData.colorPicker = visible.value;
    setStorage(STORAGE_KEYS.TOOLS_DATA, toolsData);
    logger.log(`颜色提取器显隐状态已切换为: ${visible.value}`);
  }
};

const { bindListener: bindKeyPress } = useEventListener<KeyboardEvent>(
  "keydown",
  handleKeyPress
);

/**
 * 捕获屏幕截图
 */
const captureScreen = () => {
  loading.value = true;
  chrome.runtime.sendMessage(
    { action: MESSAGE_ACTIONS.CAPTURE_SCREENSHOT },
    undefined,
    (response) => {
      if (response && response.success && response.dataUrl) {
        initCanvas(response.dataUrl);
      } else {
        showMessage("截图失败: " + (response?.error || "未知错误"));
        closePicker();
      }
    }
  );
};

/**
 * 初始化 Canvas 并绘制截图
 */
const initCanvas = (dataUrl: string) => {
  const img = new Image();
  img.onload = () => {
    if (!screenshotCanvas.value) return;

    const canvas = screenshotCanvas.value;
    // 设置 Canvas 尺寸为图片实际尺寸（可能包含 devicePixelRatio）
    canvas.width = img.width;
    canvas.height = img.height;

    ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (ctx) {
      ctx.drawImage(img, 0, 0);
      loading.value = false;
      logger.log("截图加载完成，尺寸:", img.width, img.height);

      // 初始化放大镜 Context
      if (magnifierCanvas.value) {
        magnifierCtx = magnifierCanvas.value.getContext("2d");
        if (magnifierCtx) {
          magnifierCtx.imageSmoothingEnabled = false; // 禁用平滑，显示像素格
        }
      }
    }
  };
  img.src = dataUrl;
};

/**
 * 从 Canvas 获取颜色并更新放大镜
 */
const pickColor = (clientX: number, clientY: number) => {
  if (!ctx || !screenshotCanvas.value) return;

  const canvas = screenshotCanvas.value;

  // 计算在 Canvas 上的实际坐标
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const x = (clientX - rect.left) * scaleX;
  const y = (clientY - rect.top) * scaleY;

  try {
    // 1. 获取中心点颜色
    const pixel = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
    const r = pixel[0];
    const g = pixel[1];
    const b = pixel[2];
    const a = pixel[3] / 255;
    const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;

    currentColor.value = {
      hex,
      rgb: `${r}, ${g}, ${b}`,
      rgba: `rgba(${r}, ${g}, ${b}, ${a})`,
      r, g, b
    };

    // 2. 更新放大镜
    updateMagnifier(x, y, scaleX);

  } catch (e) {
    // 边界情况
  }
};

/**
 * 绘制放大镜内容
 * @param centerX 在截图 Canvas 上的 X 坐标
 * @param centerY 在截图 Canvas 上的 Y 坐标
 * @param pixelRatio 屏幕像素比 (截图尺寸/CSS尺寸)
 */
const updateMagnifier = (centerX: number, centerY: number, pixelRatio: number) => {
  if (!magnifierCtx || !screenshotCanvas.value) {
    // 尝试重新获取 Context (如果是在 v-else 刚显示时)
    if (magnifierCanvas.value) {
      magnifierCtx = magnifierCanvas.value.getContext("2d");
      if (magnifierCtx) magnifierCtx.imageSmoothingEnabled = false;
    }
    if (!magnifierCtx) return;
  }

  const sourceCanvas = screenshotCanvas.value;
  if (!sourceCanvas || !magnifierCtx) return;

  const zoomLevel = 8; // 放大倍数
  const magnifierSize = 100; // 放大镜 Canvas 大小 (px)
  const sourceSize = magnifierSize / zoomLevel; // 需要截取的源图像大小

  // 计算源图像的截取区域
  // 注意：centerX, centerY 是具体的像素坐标
  // 我们想要截取以 (centerX, centerY) 为中心的 sourceSize * sourceSize 区域
  const sourceX = centerX - (sourceSize / 2) * pixelRatio;
  const sourceY = centerY - (sourceSize / 2) * pixelRatio;

  // 清除画布
  magnifierCtx.clearRect(0, 0, magnifierSize, magnifierSize);

  // 绘制放大的图像
  // 如果在边缘，可能需要处理边界，但 drawImage 会自动处理超出部分
  // 注意：需要考虑到 devicePixelRatio，因为我们要在放大镜里显示的是“视觉上的像素”
  // 如果 pixelRatio 是 2，意味着 1 个 CSS 像素对应 2 个物理像素
  // 我们在放大镜里想要看到 1 个 CSS 像素被放大 zoomLevel 倍

  const scaledSourceSize = sourceSize * pixelRatio;

  magnifierCtx.drawImage(
    sourceCanvas,
    sourceX, sourceY, scaledSourceSize, scaledSourceSize, // 源区域
    0, 0, magnifierSize, magnifierSize // 目标区域
  );

  // 绘制网格 (可选，为了更好看清像素)
  magnifierCtx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  magnifierCtx.lineWidth = 1;
  const pixelSize = magnifierSize / sourceSize; // 每个像素在放大镜中的大小

  magnifierCtx.beginPath();
  // 垂直线
  for (let i = 0; i <= sourceSize; i++) {
    const x = i * pixelSize;
    magnifierCtx.moveTo(x, 0);
    magnifierCtx.lineTo(x, magnifierSize);
  }
  // 水平线
  for (let i = 0; i <= sourceSize; i++) {
    const y = i * pixelSize;
    magnifierCtx.moveTo(0, y);
    magnifierCtx.lineTo(magnifierSize, y);
  }
  magnifierCtx.stroke();
};

const handleMouseMove = (e: MouseEvent) => {
  if (loading.value) return;

  requestAnimationFrame(() => {
    position.value = { x: e.clientX, y: e.clientY };
    pickColor(e.clientX, e.clientY);
  });
};

const handleClick = async (e: MouseEvent) => {
  if (loading.value) return;
  e.stopPropagation();
  e.preventDefault();

  try {
    await navigator.clipboard.writeText(currentColor.value.hex);
    showMessage(`已复制: ${currentColor.value.hex}`);
  } catch (err) {
    showMessage("复制失败");
  }
};

const showMessage = (msg: string) => {
  message.value = msg;
  if (messageTimer) clearTimeout(messageTimer);
  messageTimer = setTimeout(() => {
    message.value = "";
  }, 2000);
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Escape" && visible.value) {
    closePicker();
  }
};

const closePicker = () => {
  const toolsData = getStorage<Tools.ToolsData>(STORAGE_KEYS.TOOLS_DATA) || {};
  toolsData.colorPicker = false;
  setStorage(STORAGE_KEYS.TOOLS_DATA, toolsData);
  visible.value = false;
};

const setVisible = (val: boolean) => {
  visible.value = val;
};

// 监听 visible 变化
watch(visible, (newVal) => {
  if (newVal) {
    // 记录并禁用滚动
    originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // 开始截屏
    captureScreen();
  } else {
    // 恢复滚动
    document.body.style.overflow = originalOverflow;
    loading.value = true;
    ctx = null;
    magnifierCtx = null;
  }
});

onMounted(() => {
  bindKeyPress();
  document.addEventListener("keydown", handleKeyDown);
  // 初始化检查
  const toolsData = getStorage<Tools.ToolsData>(STORAGE_KEYS.TOOLS_DATA) || {};
  if (toolsData.colorPicker) {
    visible.value = true;
  }
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyDown);
  // 确保恢复滚动
  if (visible.value) {
    document.body.style.overflow = originalOverflow;
  }
});

defineExpose({ setVisible });
</script>

<style lang="scss" scoped>
@use "./index.scss";
</style>
