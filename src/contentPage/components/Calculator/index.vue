<template>
  <div
    v-if="visible"
    ref="calculatorContainer"
    class="calculator-container"
    :style="{ left: position.x + 'px', top: position.y + 'px' }"
  >
    <div class="calculator-header" @mousedown="startDrag">
      <div class="calculator-title">计算器</div>
      <button class="calculator-close" @click="close">×</button>
    </div>
    <div class="calculator-body">
      <div class="calculator-display">
        <div class="calculator-expression" v-if="expression">{{ expression }}</div>
        <div class="calculator-value">{{ display }}</div>
      </div>
      <div class="calculator-buttons">
        <button
          v-for="btn in buttons"
          :key="btn"
          :class="[
            'calculator-btn',
            {
              'btn-operator': ['+', '-', '×', '÷'].includes(btn),
              'btn-equals': btn === '=',
              'btn-clear': btn === 'C',
              'btn-zero': btn === '0',
            },
          ]"
          @click="handleButtonClick(btn)"
        >
          {{ btn }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { getStorage, setStorage } from "../../../utils/customLocalStorage";
import { SHORTCUT_KEYS, STORAGE_KEYS } from "../../../constants";
import { useEventListener } from "../../../hooks/useEventListener";
import { logger } from "../../../utils";


const calculatorContainer = ref<HTMLDivElement>();
const visible = ref(false);
const display = ref("0");
const expression = ref(""); // 显示表达式，如 "5 +"
const position = ref({ x: 100, y: 100 });
const isDragging = ref(false);
const dragOffset = ref({ x: 0, y: 0 });

const toolsData =
    getStorage<Tools.ToolsData>(STORAGE_KEYS.TOOLS_DATA) || {};

// 计算器状态
let currentValue = 0;
let previousValue = 0;
let operator: string | null = null;
let shouldResetDisplay = false;

const buttons = [
  "C",
  "÷",
  "×",
  "⌫",
  "7",
  "8",
  "9",
  "-",
  "4",
  "5",
  "6",
  "+",
  "1",
  "2",
  "3",
  "=",
  "0",
  ".",
];

/**
 * 处理快捷键切换计算器显隐
 */
const handleKeyPress = (event: KeyboardEvent) => {
  const { ctrl, alt, key } = SHORTCUT_KEYS.TOGGLE_CALCULATOR;

  if (event.ctrlKey === ctrl && event.altKey === alt && event.key === key) {
    event.preventDefault();
    visible.value = !visible.value;
    toolsData.calculator = visible.value;
    setStorage(STORAGE_KEYS.TOOLS_DATA, toolsData);
    logger.log(`计算器显隐状态已切换为: ${visible.value}`);
  }
};

const { bindListener: bindKeyPress } = useEventListener<KeyboardEvent>(
  "keydown",
  handleKeyPress
);

/**
 * 处理按钮点击
 */
const handleButtonClick = (btn: string) => {
  if (btn === "C") {
    clear();
  } else if (btn === "⌫") {
    backspace();
  } else if (btn === "=") {
    calculate();
  } else if (["+", "-", "×", "÷"].includes(btn)) {
    handleOperator(btn);
  } else if (btn === ".") {
    handleDecimal();
  } else {
    handleNumber(btn);
  }
};

/**
 * 处理数字输入
 */
const handleNumber = (num: string) => {
  if (shouldResetDisplay) {
    display.value = num;
    shouldResetDisplay = false;
  } else {
    display.value = display.value === "0" ? num : display.value + num;
  }
};

/**
 * 处理小数点
 */
const handleDecimal = () => {
  if (shouldResetDisplay) {
    display.value = "0.";
    shouldResetDisplay = false;
  } else if (!display.value.includes(".")) {
    display.value += ".";
  }
};

/**
 * 处理运算符
 */
const handleOperator = (op: string) => {
  const inputValue = parseFloat(display.value);

  if (previousValue === 0) {
    previousValue = inputValue;
    expression.value = `${display.value} ${op}`;
  } else if (operator) {
    const result = performCalculation();
    display.value = String(result);
    previousValue = result;
    expression.value = `${display.value} ${op}`;
  } else {
    expression.value = `${display.value} ${op}`;
  }

  operator = op;
  shouldResetDisplay = true;
};

/**
 * 执行计算
 */
const performCalculation = (): number => {
  const inputValue = parseFloat(display.value);

  switch (operator) {
    case "+":
      return previousValue + inputValue;
    case "-":
      return previousValue - inputValue;
    case "×":
      return previousValue * inputValue;
    case "÷":
      return inputValue !== 0 ? previousValue / inputValue : 0;
    default:
      return inputValue;
  }
};

/**
 * 计算并显示结果
 */
const calculate = () => {
  if (operator) {
    const result = performCalculation();
    expression.value = `${previousValue} ${operator} ${display.value} =`;
    display.value = String(result);
    previousValue = 0;
    operator = null;
    shouldResetDisplay = true;
  }
};

/**
 * 清除
 */
const clear = () => {
  display.value = "0";
  expression.value = "";
  currentValue = 0;
  previousValue = 0;
  operator = null;
  shouldResetDisplay = false;
};

/**
 * 退格
 */
const backspace = () => {
  if (display.value.length > 1) {
    display.value = display.value.slice(0, -1);
  } else {
    display.value = "0";
  }
};

/**
 * 开始拖拽
 */
const startDrag = (e: MouseEvent) => {
  if (!calculatorContainer.value) return;
  isDragging.value = true;
  const rect = calculatorContainer.value.getBoundingClientRect();
  dragOffset.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
  document.addEventListener("mousemove", onDrag);
  document.addEventListener("mouseup", stopDrag);
  e.preventDefault();
};

/**
 * 拖拽中
 */
const onDrag = (e: MouseEvent) => {
  if (!isDragging.value) return;
  position.value = {
    x: e.clientX - dragOffset.value.x,
    y: e.clientY - dragOffset.value.y,
  };
  // 限制在窗口内
  const maxX = window.innerWidth - (calculatorContainer.value?.offsetWidth || 0);
  const maxY = window.innerHeight - (calculatorContainer.value?.offsetHeight || 0);
  position.value.x = Math.max(0, Math.min(position.value.x, maxX));
  position.value.y = Math.max(0, Math.min(position.value.y, maxY));
};

/**
 * 停止拖拽
 */
const stopDrag = () => {
  isDragging.value = false;
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", stopDrag);
  // 保存位置
  setStorage("calculator_position", position.value);
};

/**
 * 关闭计算器
 */
const close = () => {
  const toolsData =
    getStorage<Tools.ToolsData>(STORAGE_KEYS.TOOLS_DATA) || {};
  toolsData.calculator = false;
  setStorage(STORAGE_KEYS.TOOLS_DATA, toolsData);
  visible.value = false;
};

/**
 * 设置计算器可见性
 */
const setVisible = (value: boolean) => {
  visible.value = value;
  if (value) {
    // 从存储中恢复位置
    const savedPosition = getStorage<{ x: number; y: number }>(
      "calculator_position"
    );
    if (savedPosition) {
      position.value = savedPosition;
    }
  }
};

onMounted(() => {
  bindKeyPress()

  visible.value = toolsData.calculator || false;
  if (visible.value) {
    const savedPosition = getStorage<{ x: number; y: number }>(
      "calculator_position"
    );
    if (savedPosition) {
      position.value = savedPosition;
    }
  }
});

onUnmounted(() => {
  // 保存位置
  setStorage("calculator_position", position.value);
  stopDrag();
});

defineExpose({ setVisible });
</script>

<style lang="scss" scoped>
@use "./index.scss";
</style>
