import test from "ava";
import { tap } from "./Function.Extra";

test("tap calls the given function and returns the given value (not the result)", (t) => {
  let spy = 0;
  const f = (n: number) => {
    spy = n + 2;
  };

  const actual = tap(f)(1);

  const expected = 1;
  t.is(actual, expected);
  t.is(spy, 3);
});
