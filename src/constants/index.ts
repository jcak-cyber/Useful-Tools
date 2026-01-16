/**
 * 应用常量配置
 */

/** Storage 键名 */
export const STORAGE_KEYS = {
  TOOLS_DATA: "toolsData",
} as const;

/** 消息动作常量 */
export const MESSAGE_ACTIONS = {
  TO_CONTENT_SCRIPT: "TO_CONTENT_SCRIPT",
  POPUP_OPENED: "popupOpened",
} as const;

/** 快捷键配置 */
export const SHORTCUT_KEYS = {
  TOGGLE_BLUR: {
    ctrl: true,
    alt: true,
    key: "b",
  },
} as const;

/** 默认配置 */
export const DEFAULT_CONFIG = {
  STORAGE_LISTENER_DELAY: 400,
  DOM_REINSERT_DELAY: 500,
  CONTENT_SCRIPT_ID: "extensions-content",
} as const;
