/**
 * Function.tap :: (a -> any) -> (a -> a)
 *
 * Given a, probably, side-effect-ful function, `f`, returns a function that takes some argument, `a`, and runs `f` given `a`, ignoring the return value and instead returning `a`.
 *
 * @example
 *   const log = tap((a) => console.log(a));
 *   const three = log(1 + 2); // 3
 */
export const tap = <A>(f: (a: A) => any) => (a: A): A => {
  f(a);
  return a;
};
