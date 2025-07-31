import { createVueApp } from "../contentPage/main";

const init = (): { divEl: HTMLDivElement; id: string } => {
  const divEl = document.createElement("div");
  divEl.id = "extensions-content";

  return { divEl, id: divEl.id };
};

// content注入
if (window.top === window.self) {
  const { divEl, id } = init();
  document.body.appendChild(divEl);

  createVueApp(id);
}
