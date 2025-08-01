export const useKeyPress = (callback: () => void) => {
  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.ctrlKey && event.altKey && event.key === "b") {
      callback();
    }
  };

  const bindKeyPress = () => {
    if (!window || window.top !== window.self) return;
    window.addEventListener("keydown", handleKeyPress);
  };

  const removeKeyPress = () => {
    if (!window || window.top !== window.self) return;

    window.removeEventListener("keydown", handleKeyPress);
  };

  return { bindKeyPress, removeKeyPress };
};
