// replaced appropriately when bundled by @rollup/plugin-replace
const build = "__build__" as "development" | "production";

/** True if the build is a production build */
export const isProduction = build === "production";