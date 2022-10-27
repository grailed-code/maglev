import { Request } from "../Request";
import { getAll, Build, isSuccessful } from "./Build";
import * as Env from "../Env";
import { pipe } from "fp-ts/lib/function";
import { map } from "fp-ts/lib/TaskEither";
import { filter } from "fp-ts/lib/Array";

const sourceBranch = Env.get("SOURCE_BRANCH");

/**
 * getAllGreenSourceBuilds :: () -> Request (Array CircleCI.Build)
 *
 * Returns a task of an array of all of the CircleCI builds that are for the Source branch and are
 * successful ("green").
 */
export const getAllGreenSourceBuilds = (): Request<Array<Build>> => {
  return pipe(
    getAll(sourceBranch),
    map(filter(isSuccessful)),
  );
}
export { Build };
