import { isProduction } from "./build";

/**
 * Log just like `console.log`, but only under development
 *
 * @param args stuff to log
 */
export const log = (...args: unknown[]) => {
  if (!isProduction) {
    console.log(...args);
  }
};
