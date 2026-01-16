import { createVueApp } from "../contentPage/main";
import {
  createDomObserver,
  disconnectObserver,
} from "../utils/createDomObserver";
import { DEFAULT_CONFIG } from "../constants";
import { logger } from "../utils/logger";

/**
 * 初始化内容脚本容器
 */
const init = (): { divEl: HTMLDivElement; id: string } => {
  const divEl = document.createElement("div");
  divEl.id = DEFAULT_CONFIG.CONTENT_SCRIPT_ID;

  return { divEl, id: divEl.id };
};

/**
 * 检查是否为主窗口（排除 iframe）
 */
const isMainWindow = (): boolean => {
  return window.top === window.self;
};

/**
 * 检查元素是否已存在
 */
const isElementExists = (id: string): boolean => {
  return !!document.getElementById(id);
};

/**
 * 注入内容脚本到页面
 */
const insertContent = (): void => {
  if (!isMainWindow()) {
    logger.log("跳过 iframe，不注入内容脚本");
    return;
  }

  const { divEl, id } = init();

  // 检查元素是否已存在，避免重复注入
  if (isElementExists(id)) {
    logger.log("内容脚本容器已存在，跳过注入");
    return;
  }

  try {
    document.body.appendChild(divEl);

    // 在元素添加到DOM后立即创建观察器
    createDomObserver(document.documentElement, (mutation) => {
      const removedNodes = Array.from(mutation.removedNodes);

      if (removedNodes.includes(divEl)) {
        logger.log("元素已被删除，准备重新注入");
        disconnectObserver();
        
        setTimeout(() => {
          insertContent();
          logger.log("重新注入完成");
        }, DEFAULT_CONFIG.DOM_REINSERT_DELAY);
      }
    });

    createVueApp(id);
    logger.log("内容脚本注入成功");
  } catch (error) {
    logger.error("内容脚本注入失败:", error);
  }
};

// 确保 DOM 加载完成后再注入
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", insertContent);
} else {
  insertContent();
}
