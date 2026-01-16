import { logger } from "../utils/logger";
import { MESSAGE_ACTIONS } from "../constants";
import type { Tools } from "../types/types";

/**
 * Background Service Worker
 * 处理来自 popup、content script 等的消息
 */
chrome.runtime.onMessage.addListener(
  (message: Tools.MessageBody, sender, sendResponse) => {
    logger.log("Background script received message:", message);
    logger.log("Sender:", sender);

    try {
      if (message.action === MESSAGE_ACTIONS.POPUP_OPENED) {
        logger.log("检测到 Popup 页面已打开");
        // 执行相关逻辑（如更新状态、发送通知等）
      }

      // 返回 false 表示异步响应
      return false;
    } catch (error) {
      logger.error("处理消息时发生错误:", error);
      sendResponse({ success: false, error: String(error) });
      return false;
    }
  }
);
