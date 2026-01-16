import { useGlobalStore } from "../stores";
import { logger } from "./logger";

/**
 * 从 localStorage 获取数据
 * @param key - 存储键名
 * @returns 解析后的数据，失败返回 null
 */
export const getStorage = <T = any>(key: string): T | null => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error(`getStorage error for key "${key}":`, error);
    return null;
  }
};

/**
 * 设置 localStorage 数据
 * @param key - 存储键名
 * @param value - 要存储的值
 * @param canEdit - 是否允许编辑（默认 true）
 */
export const setStorage = <T = any>(
  key: string,
  value: T,
  canEdit: boolean = true
): void => {
  try {
    if (canEdit) {
      const globalStore = useGlobalStore();
      globalStore.setCanEditStorage(true);
    }

    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    logger.error(`setStorage error for key "${key}":`, error);
    throw error;
  }
};

/**
 * 移除 localStorage 数据
 * @param key - 存储键名
 */
export const removeStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    logger.error(`removeStorage error for key "${key}":`, error);
  }
};

/**
 * 从 popup 获取当前标签页的 localStorage 数据
 * @param key - 存储键名
 * @returns Promise，解析为存储的值或 null
 */
export const getStorageByPopup = <T = any>(key: string): Promise<T | null> => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (!tabId) {
        reject(new Error("No active tab found"));
        return;
      }

      // 注入脚本读取网页的 localStorage
      chrome.scripting.executeScript(
        {
          target: { tabId },
          func: function (storageKey: string) {
            try {
              const data = localStorage.getItem(storageKey);
              return data ? JSON.parse(data) : null;
            } catch (error) {
              return null;
            }
          },
          args: [key],
        } as any,
        (results) => {
          // @ts-expect-error - Chrome API 类型定义问题，lastError 在运行时存在
          const lastError = chrome.runtime.lastError;
          if (lastError) {
            logger.error("getStorageByPopup error:", lastError);
            reject(new Error(lastError.message));
            return;
          }

          const pageValue = results?.[0]?.result ?? null;
          resolve(pageValue);
        }
      );
    });
  });
};

/**
 * 创建 storage 监听器（使用轮询方式）
 * 注意：由于 content script 无法直接监听 storage 事件，使用轮询作为替代方案
 * @param key - 要监听的 storage 键名
 * @param delay - 轮询延迟（毫秒），默认 400ms
 * @param callback - 回调函数，返回 true 时停止监听
 * @returns 包含 start 和 stop 方法的对象
 */
export const storageListener = <T>(
  key: string,
  delay: number = 400,
  callback: (value: T | null) => boolean
) => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let previousValue: T | null = null;

  const start = () => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      const currentValue = getStorage<T>(key);

      // 只在值发生变化时调用回调
      if (JSON.stringify(currentValue) !== JSON.stringify(previousValue)) {
        previousValue = currentValue;
        const shouldStop = callback(currentValue);

        if (shouldStop) {
          stop();
          return;
        }
      }

      start();
    }, delay);
  };

  const stop = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    previousValue = null;
  };

  return {
    start,
    stop,
  };
};
