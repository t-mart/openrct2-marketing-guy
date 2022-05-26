import { isProduction } from "./build";
import { ALL_CAMPAIGNS } from "./campaign";
import { getOptionsWindow } from "./optionsWindow";

export const startPlugin = (): void => {
  if (!isProduction) {
    // to invalidate old storage formats during development
    ALL_CAMPAIGNS.forEach(c => c.clearRepeatFromStorage())
  }
  ALL_CAMPAIGNS.forEach(c => c.restoreRepeatFromStorage())

  if (typeof ui !== "undefined") {
    ui.registerMenuItem("__human_name__", () => getOptionsWindow());
    // getOptionsWindow()
  }
};
