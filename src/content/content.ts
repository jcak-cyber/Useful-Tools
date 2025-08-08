import { createVueApp } from "../contentPage/main";
import {
  createDomObserver,
  disconnectObserver,
} from "../utils/createDomObserver";

const init = (): { divEl: HTMLDivElement; id: string } => {
  const divEl = document.createElement("div");
  divEl.id = "extensions-content";

  return { divEl, id: divEl.id };
};

// content注入
const insertContent = () => {
  if (window.top === window.self) {
    const { divEl, id } = init();
    document.body.appendChild(divEl);

    // 在元素添加到DOM后立即创建观察器
    createDomObserver(document.documentElement, (mutation) => {
      const removedNodes = Array.from(mutation.removedNodes);

      if (removedNodes.includes(divEl)) {
        console.log("元素已被删除", removedNodes);
        disconnectObserver();
        console.log("正在重新注入");
        setTimeout(() => {
          insertContent();
          console.log("重新注入完成");
        }, 500);
      }
    });

    createVueApp(id);
  }
};

insertContent();
