import { flow } from "fp-ts/lib/function";
import { tap } from "./Function.Extra";

// const jsonStringify: <A>(a: A) => string = JSON.stringify;
const consoleLog: <A>(a: A) => void = console.log.bind(console);

/**
 * log :: A -> A
 *
 * Logs the given value and returns the given value unchanged.
 */
export const log: <A>(a: A) => A = tap(
  flow(
    consoleLog,
  ),
);
