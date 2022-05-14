import * as os from "node:os";
import * as process from "node:process";
import * as path from "node:path";

import { defineConfig, OutputOptions } from "rollup";
import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
// import del from "rollup-plugin-delete";

import pkg from "./package.json";

// type-ify and ensure BuildType
const buildTypes = ["production", "development"] as const;
type BuildType = typeof buildTypes[number];
function isBuildType(o: unknown): o is BuildType {
  return buildTypes.includes(o as BuildType);
}
const build = process.env["BUILD"];
if (!isBuildType(build)) {
  throw new Error(
    `This rollup config requires an environment variable $BUILD set to either: ${buildTypes}`
  );
}
const isProduction = build === "production";
console.log(isProduction);

const getOutputs = (install: boolean): OutputOptions[] => {
  const fileName = `${pkg.name}-${pkg.version}-${build}.js`;
  const outputs: OutputOptions[] = [
    {
      file: path.join(`dist`, fileName),
      format: "iife",
    },
  ];

  if (install) {
    switch (process.platform) {
      case "win32":
        outputs.push({
          file: path.join(os.homedir(), "Documents\\OpenRCT2\\plugin", fileName),
          format: "iife",
        });
        break;
      default:
        throw new Error(`Don't know how to install for platform ${process.platform}. File a bug.`);
    }
  }
  return outputs;
};
const output = getOutputs(process.env["INSTALL"] !== undefined);

export default async () =>
  defineConfig({
    input: "./src/index.ts",
    output,
    plugins: [
    //   del({ targets: output.flatMap((o) => (o.file ? [o.file] : [])), runOnce: true }),
      replace({
        preventAssignment: true,
        values: {
          __build__: build,
          __version__: pkg.version,
          __description__: pkg.description,
          __author__: pkg.author,
          __name__: pkg.name,
          __license__: pkg.license,
        },
      }),
      typescript({
        tsconfig: "./src/tsconfig.json",
      }),
      nodeResolve(),
    ],
  });
