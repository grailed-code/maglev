import { map } from "fp-ts/lib/Array";

export const zipFill = <A, B>([as, b]: [Array<A>, B]) =>
  map((a: A): [A, B] => [a, b])(as);
