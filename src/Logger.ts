import { flow } from "fp-ts/lib/function";
import { tap } from "./Function.Extra";

const jsonStringify = <A>(obj: A): string => {
  let cache: Array<any>  = [];

  let str = JSON.stringify(obj, (_key, value: any) => {
    if (typeof value === "object" && value !== null) {
      if (cache.indexOf(value) !== -1) {
        // Circular reference found, discard key
        return;
      }
      // Store value in our collection
      cache.push(value);
    }
    return value;
  });

  cache = []; // reset the cache
  return str;
}

const consoleLog: <A>(a: A) => void = console.log.bind(console);

/**
 * log :: A -> A
 *
 * Logs the given value and returns the given value unchanged.
 */
export const log: <A>(a: A) => A = tap(
  flow(
    jsonStringify,
    consoleLog,
  ),
);
