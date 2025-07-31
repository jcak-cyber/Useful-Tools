chrome.runtime.onMessage.addListener((message, sender) => {
  console.log("Background script received message:", message);
  console.log("Sender:", sender);

  if (message.action === "popupOpened") {
    console.log(sender);

    console.log("检测到Popup页面已打开");
    // 执行相关逻辑（如更新状态、发送通知等）
  }

  return false;
});
