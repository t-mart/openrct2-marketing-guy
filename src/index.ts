import { startPlugin } from "./main";

registerPlugin({
  name: "__name__",
  version: "__version__-__build__",
  authors: "__author__",
  type: "local",
  licence: "__license__",
  minApiVersion: 52,
  main: startPlugin,
});
