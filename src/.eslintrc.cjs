module.exports = {
  root: true,
  env: {
    es2021: true,
  },
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:@typescript-eslint/strict",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"]
  },
  rules: {
  },
  plugins: ["@typescript-eslint"],
  ignorePatterns: ["../lib/openrct2.d.ts", "../dist/", ".eslintrc.cjs"],
};
