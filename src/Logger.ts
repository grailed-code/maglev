import { tap } from "./Function.Extra";

/**
 * log :: A -> A
 *
 * Logs the given value and returns the given value unchanged.
 */
export const log: <A>(a: A) => A = tap((a) => console.log(a));
