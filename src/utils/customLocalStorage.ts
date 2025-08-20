export const getStorage = (key: string): any => {
  const data = localStorage.getItem(key);
  try {
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const setStorage = (key: string, value: any): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const removeStorage = (key: string): void => {
  localStorage.removeItem(key);
};

export const getStorageByPopup = (key: string) => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;
      if (!tabId) {
        reject(null);
        return;
      }
      // 注入脚本读取网页的 localStorage
      chrome.scripting.executeScript(
        {
          target: { tabId },
          func: function () {
            const key = arguments[0];
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
          }, // 在网页上下文中执行
          args: [key],
        },
        (results) => {
          const pageValue = results[0].result; // 获取结果
          pageValue ? resolve(pageValue) : reject(null);
        }
      );
    });
  });
};

export const storageListener = <T>(
  key: string,
  delay: number = 400,
  callback: (value: T) => boolean
) => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const start = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      const flag = callback(getStorage(key));
      if (flag) {
        stop();
        return;
      }
      start();
    }, delay);
  };

  const stop = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };

  return {
    start,
    stop,
  };
};
