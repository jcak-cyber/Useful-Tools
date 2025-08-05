export const getStorage = (key: string): any => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
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
