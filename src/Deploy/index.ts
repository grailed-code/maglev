import {
  array,
  map as arrayMap,
  ap as arrayAp,
  filter,
  sortBy,
  reverse,
  head,
} from "fp-ts/lib/Array";
import { flow } from "fp-ts/lib/function";
import {
  TaskEither,
  taskEither,
  map as taskEitherMap,
} from "fp-ts/lib/TaskEither";
import * as Codeship from "../Codeship";
import * as Github from "../Github";
import * as Heroku from "../Heroku";
import * as Bundle from "./Bundle";

export { Bundle };

export interface Deploy {
  targets: Array<string>;
  comparison: Github.Comparison.Comparison;
  codeshipBuild: Codeship.Build.Build;
  builds: Array<Heroku.Build.Build>;
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
 * those functions to the bundle's Codeship build's commit sha; this results in an array of tasks
 * of Heroku builds.
 *
 * It's significantly easier for us to work with a single task of an array of builds, instead of an
 * array of tasks of builds:
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
export const fromBundle = (bundle: Bundle.Bundle): TaskEither<string, Deploy> =>
  flow(
    arrayMap(Heroku.Build.create),
    arrayAp([bundle.codeshipBuild.commit_sha]),
    array.sequence(taskEither),
    taskEitherMap((builds: Array<Heroku.Build.Build>) => ({
      ...bundle,
      builds,
    })),
  )(bundle.targets);

/**
 * getBestBundle :: Array Bundle -> Option Bundle
 *
 * Given an array of deploy bundles, tries to get the best one to deploy.
 * First, we remove all of the bundles that are not deployable.
 * Then we choose the bundle with the most recent queued at timestamp on its Codeship build.
 */
export const getBestBundle = flow(
  filter(Bundle.isDeployable),
  sortBy([Bundle.byQueuedAt]),
  reverse,
  head,
);
