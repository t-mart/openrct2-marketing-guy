import * as os from "node:os";
import * as process from "node:process";
import * as path from "node:path";

import { defineConfig, OutputOptions } from "rollup";
import typescript from "@rollup/plugin-typescript";
import replace from "@rollup/plugin-replace";
import commonjs from '@rollup/plugin-commonjs';

import pkg from "./package.json";

const outputDir = "./dist";

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

const getOutputs = (install: boolean): OutputOptions[] => {
  const fileName = `${pkg.name}-${pkg.version}-${build}.js`;
  const outputs: OutputOptions[] = [
    {
      file: path.join(outputDir, fileName),
      format: "iife",
    },
  ];

  if (install) {
    let pluginDir = process.env["PLUGIN_DIR"];
    if (!pluginDir) {
      switch (process.platform) {
        case "win32": {
          pluginDir = path.join(os.homedir(), "Documents\\OpenRCT2\\plugin");
          break;
        }
        case "darwin": {
          pluginDir = path.join(os.homedir(), "Library/Application Support/OpenRCT2/plugin");
          break;
        }
        case "linux": {
          const xdgConfigHome = process.env["XDG_CONFIG_HOME"];
          if (xdgConfigHome) {
            pluginDir = path.join(xdgConfigHome, "OpenRCT2/plugin");
          } else {
            pluginDir = path.join(os.homedir(), ".config/OpenRCT2/plugin");
          }
          pluginDir = path.join(os.homedir(), "Library/Application Support/OpenRCT2/plugin");
          break;
        }
        default:
          throw new Error(
            `Don't know how to install for platform ${process.platform}. File a bug.`
          );
      }
    }
    outputs.push({
      file: path.join(pluginDir, fileName),
      format: "iife",
    });
  }
  return outputs;
};

const output = getOutputs(process.env["INSTALL"] !== undefined);

export default async () =>
  defineConfig({
    input: "./src/index.ts",
    output,
    watch: {
      clearScreen: false,
    },
    plugins: [
      replace({
        preventAssignment: true,
        values: {
          __build__: build,
          __version__: pkg.version,
          __description__: pkg.description,
          __author__: pkg.author,
          __name__: pkg.name,
          __human_name__: pkg.meta.humanName,
          __license__: pkg.license,
        },
      }),
      typescript({
        tsconfig: "./src/tsconfig.json",
      }),
      commonjs(),
    ],
  });
