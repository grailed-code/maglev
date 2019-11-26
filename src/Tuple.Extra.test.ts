import test from "ava";
import { zipFill } from "./Tuple.Extra";

test("zipFill", (t) => {
  const actual = zipFill([[1, 2, 3], "number"]);

  const expected = [[1, "number"], [2, "number"], [3, "number"]];
  t.deepEqual(actual, expected);
});
