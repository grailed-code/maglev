import { filter, isEmpty, isNonEmpty } from "fp-ts/lib/Array";
import { Predicate, flow, not } from "fp-ts/lib/function";

/**
 * any :: Predicate a -> Predicate (Array a)
 *
 * Returns true when the given predicate is true for any number of the members of the given array.
 */
export const any = <A>(p: Predicate<A>): Predicate<Array<A>> =>
  flow(
    filter(p),
    isNonEmpty,
  );

/**
 * all :: Predicate a -> Predicate (Array a)
 *
 * Returns true when the given predicate is true for all of the members of the given array.
 */
export const all = <A>(p: Predicate<A>): Predicate<Array<A>> =>
  flow(
    filter(not(p)),
    isEmpty,
  );
