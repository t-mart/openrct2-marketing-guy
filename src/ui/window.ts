import type { TWidgetBase } from "./widgets";

export function openWindow(
  desc: Omit<WindowDesc, "widgets"> & { widgets: TWidgetBase<WidgetBase & { name: string }>[] }
) {
  const window = ui.openWindow(desc);
  const seenNames = [];
  for (const widget of desc.widgets) {
    const name = widget.name;
    if (seenNames.indexOf(name) === -1) {
      seenNames.push(name);
    } else {
      throw new Error(`Widget name ${name} is not unique`);
    }
    widget.bind(window);
  }
  return window;
}
