import { onUnmounted } from "vue";

/** 支持的事件类型 */
type EventKey = "keydown" | "keyup" | "click" | "mousedown" | "mouseup";

/**
 * 事件监听器 Hook
 * @param eventKey - 事件类型
 * @param callback - 事件回调函数
 * @returns 包含绑定和移除监听器方法的对象
 */
export const useEventListener = <T extends Event>(
  eventKey: EventKey,
  callback: (e: T) => void
) => {
  const handleEvent = (event: Event) => {
    callback(event as T);
  };

  /**
   * 绑定事件监听器
   */
  const bindListener = () => {
    if (!window || window.top !== window.self) {
      return;
    }

    window.addEventListener(eventKey, handleEvent);
  };

  /**
   * 移除事件监听器
   */
  const removeListener = () => {
    if (!window || window.top !== window.self) {
      return;
    }

    window.removeEventListener(eventKey, handleEvent);
  };

  onUnmounted(() => {
    removeListener();
  });

  return {
    bindListener,
    removeListener,
  };
};
