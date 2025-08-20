import { onUnmounted } from "vue";

type EventKey = "keydown";

export const useEventListener = <T>(
  eventKey: EventKey,
  callback: (e: T) => void
) => {
  const handleKeyPress = (event: KeyboardEvent) => {
    callback(event as T);
  };

  const bindListener = () => {
    if (!window || window.top !== window.self) return;
    switch (eventKey) {
      case "keydown":
        window.addEventListener("keydown", handleKeyPress);
        break;
      default:
        break;
    }
  };

  const removeListener = () => {
    if (!window || window.top !== window.self) return;

    window.removeEventListener("keydown", handleKeyPress);
  };

  onUnmounted(() => {
    removeListener();
  });

  return { bindListener };
};
