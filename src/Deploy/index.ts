import {
  array,
  map as arrayMap,
  ap as arrayAp,
  filter,
  sortBy,
  reverse,
  head,
} from "fp-ts/lib/Array";
import { Either, right } from "fp-ts/lib/Either";
import { flow } from "fp-ts/lib/function";
import { task, map as taskMap } from "fp-ts/lib/Task";
import { TaskEither, map as taskEitherMap } from "fp-ts/lib/TaskEither";
import * as CircleCI from "../CircleCI";
import * as Github from "../Github";
import * as Heroku from "../Heroku";
import { RequestError } from "../Request";
import * as Bundle from "./Bundle";

export { Bundle };

export interface Deploy {
  targets: Array<string>;
  comparison: Github.Comparison.Comparison;
  circleCIBuild: CircleCI.Build;
  builds: Array<Either<RequestError, Heroku.Build.Build>>;
}

/**
 * fromBundle :: Bundle -> TaskEither String Deploy
 *
 * Returns a task of a deploy from the given bundle.
 *
 * This is the function that actually does the deploy to the various targets specified in the
 * bundle, and does all of the work to package the results up into a single, tidy task.
 *
 * From the list of targets, we partially apply Heroku.Build.create with each target, then we apply
 * those functions to the bundle's CircleCI build's commit sha; this results in an array of tasks
 * of Heroku builds.
 *
 * It's significantly easier for us to work with a single task of an array of builds (either
 * successful or unsuccessful), instead of an array of tasks of builds:
 *
 *   Have: Array (TaskEither String HerokuBuild)
 *   Want: TaskEither String (Array HerokuBuild)
 *
 * To accomplish this, we can use array.sequence(taskEither):
 *
 *  array.sequence(taskEither) :: Array (TaskEither e a)
 *                             -> TaskEither e (Array a)
 *
 * Now that we have our task of array of builds, we can create a deploy by mapping over the
 * TaskEither and adding the list of builds to the bundle we were initially given.
 */
export const fromBundle = (
  bundle: Bundle.Bundle,
): TaskEither<RequestError, Deploy> =>
  flow(
    arrayMap(Heroku.Build.safelyCreate),
    arrayAp([bundle.circleCIBuild.commit_sha]),
    array.sequence(task),
    taskMap(right),
    taskEitherMap(
      (builds: Array<Either<RequestError, Heroku.Build.Build>>) => ({
        ...bundle,
        builds,
      }),
    ),
  )(bundle.targets);

/**
 * getBestBundle :: Array Bundle -> Option Bundle
 *
 * Given an array of deploy bundles, tries to get the best one to deploy.
 * First, we remove all of the bundles that are not deployable.
 * Then we choose the bundle with the most recent queued at timestamp on its CircleCI build.
 */
export const getBestBundle = flow(
  filter(Bundle.isDeployable),
  sortBy([Bundle.byQueuedAt]),
  reverse,
  head,
);
