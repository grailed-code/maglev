import { filter } from "fp-ts/lib/Array";
import { flow } from "fp-ts/lib/function";
import { map } from "fp-ts/lib/TaskEither";
import * as Env from "../Env";
import { Request } from "../Request";
import * as Build from "./Build";

const projectId = Env.get("CODESHIP_PROJECT_ID");

/**
 * getAllGreenSourceBuilds :: () -> Request (Array Codeship.Build.Build)
 *
 * Returns a task of an array of all of the Codeship builds that are for the Source branch and are
 * successful ("green").
 */
export const getAllGreenSourceBuilds: () => Request<Array<Build.Build>> = flow(
  () => Build.getAll(projectId),
  map(filter(Build.isSourceBranch)),
  map(filter(Build.isSuccessful)),
);

export { Build };
