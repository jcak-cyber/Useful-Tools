import { logger } from "../utils/logger";
import { MESSAGE_ACTIONS } from "../constants";


/**
 * Background Service Worker
 * 处理来自 popup、content script 等的消息
 */
chrome.runtime.onMessage.addListener(
  (message: Tools.MessageBody, sender, sendResponse: (response?: any) => void) => {
    logger.log("Background script received message:", message);
    logger.log("Sender:", sender);

    try {
      if (message.action === MESSAGE_ACTIONS.POPUP_OPENED) {
        logger.log("检测到 Popup 页面已打开");
        // 执行相关逻辑（如更新状态、发送通知等）
      } else if (message.action === MESSAGE_ACTIONS.CAPTURE_SCREENSHOT) {
        chrome.tabs.captureVisibleTab(undefined, { format: "png" }, (dataUrl) => {
          if ((chrome.runtime as any).lastError) {
            logger.error("截图失败:", (chrome.runtime as any).lastError);
            sendResponse({ success: false, error: (chrome.runtime as any).lastError.message });
          } else {
            sendResponse({ success: true, dataUrl });
          }
        });
        return true; // 保持消息通道开启以进行异步响应
      }

      // 返回 false 表示同步响应（或不需要响应）
      return false;
    } catch (error) {
      logger.error("处理消息时发生错误:", error);
      sendResponse({ success: false, error: String(error) });
      return false;
    }
  }
);
