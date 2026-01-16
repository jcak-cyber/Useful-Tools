import { logger } from "./logger";

let observer: MutationObserver | null = null;

/**
 * 创建 DOM 观察器
 * @param target - 要观察的目标元素
 * @param callback - 变化回调函数
 * @param config - 观察器配置（可选）
 */
export const createDomObserver = (
  target: HTMLElement,
  callback: (mut: MutationRecord) => void,
  config?: MutationObserverInit
) => {
  // 清理之前的观察器
  if (observer) {
    observer.disconnect();
    observer = null;
  }

  if (!target) {
    logger.error("createDomObserver: 目标元素不存在");
    return;
  }

  observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      callback(mutation);
    });
  });

  const observerConfig: MutationObserverInit = config || {
    childList: true, // 观察直接子节点
    subtree: true, // 观察所有后代节点
    attributes: true, // 观察属性变化
    attributeOldValue: true, // 记录属性旧值
    characterData: false, // 不观察文本内容变化
    attributeFilter: ["id", "class", "style"], // 只观察关键属性变化
  };

  try {
    observer.observe(target, observerConfig);
    logger.log("createDomObserver: 观察器已启动", observerConfig);
  } catch (error) {
    logger.error("createDomObserver: 启动观察器失败", error);
  }
};

/**
 * 断开 DOM 观察器
 */
export const disconnectObserver = () => {
  if (!observer) {
    logger.log("disconnectObserver: 没有活动的观察器");
    return;
  }
  observer.disconnect();
  observer = null;
  logger.log("disconnectObserver: 观察器已断开");
};
