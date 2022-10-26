import { Request } from "../Request";
import { getAll, Build } from "./Build";
import * as Env from "../Env";

const sourceBranch = Env.get("SOURCE_BRANCH");

/**
 * getAllGreenSourceBuilds :: () -> Request (Array CircleCI.Build)
 *
 * Returns a task of an array of all of the CircleCI builds that are for the Source branch and are
 * successful ("green").
 */
export const getAllGreenSourceBuilds = (): Request<Array<Build>> => getAll(sourceBranch);

export { Build };
