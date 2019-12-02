import test from "ava";
import { any, all } from "./Array.Extra";

test("any when the given predicate is true for some of the members", (t) => {
  const gt5 = (x: number) => x > 5;
  const numbers = [1, 2, 3, 4, 5, 6];

  const actual = any(gt5)(numbers);

  t.true(actual);
});

test("any when the given predicate is true for none of the members", (t) => {
  const gt10 = (x: number) => x > 10;
  const numbers = [1, 2, 3, 4, 5, 6];

  const actual = any(gt10)(numbers);

  t.false(actual);
});

test("all when the given predicate is true for some of the members", (t) => {
  const gt5 = (x: number) => x > 5;
  const numbers = [1, 2, 3, 4, 5, 6];

  const actual = all(gt5)(numbers);

  t.false(actual);
});

test("all when the given predicate is true for all of the members", (t) => {
  const lt10 = (x: number) => x < 10;
  const numbers = [1, 2, 3, 4, 5, 6];

  const actual = all(lt10)(numbers);

  t.true(actual);
});
