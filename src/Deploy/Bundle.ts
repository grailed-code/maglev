import { isRight } from "fp-ts/lib/Either";
import { flow } from "fp-ts/lib/function";
import { ord, ordDate } from "fp-ts/lib/Ord";
import { TaskEither, left, map } from "fp-ts/lib/TaskEither";
import * as Codeship from "../Codeship";
import * as Env from "../Env";
import * as Github from "../Github";
import * as Heroku from "../Heroku";

const appName = Env.get("HEROKU_APP_NAME");

export interface Bundle {
  targets: Array<string>;
  comparison: Github.Comparison.Comparison;
  codeshipBuild: Codeship.Build.Build;
}

/**
 * fromBuildAndSlug :: Tuple Codeship.Build.Build Heroku.Slug.Slug -> TaskEither String Bundle
 *
 * Returns a task of a deploy bundle created from the given Codeship build and Heroku slug. In
 * order to create a bundle, we need three things:
 *
 * - a set of targets, declared in the environment (for now);
 * - a build from Codeship that we might want to deploy; and
 * - a git comparison of the commit from the Codeship build against the commit from the Heroku slug.
 *
 * If the Heroku slug does not have a commit, we immediately return a Left of an error message.
 *
 * In Either (and TaskEither), left is traditionally where we put errors. Functions like map, chain,
 * etc. will only operate on the right side of the Either. If we need to map functions over the
 * left side, we can use functions like bimap or mapLeft.
 *
 * Similarly to the Heroku slug, if the Codeship build doesn't have a commit sha, we immediately
 * return a Left of an error message.
 *
 * Once we know that we have commit shas from the Heroku slug and the Codeship build, we can make
 * task of a request to get a comparison of those shas from Github. With that task in hand, we can
 * map over it to create a task of the created deploy bundle.
 */
export const fromBuildAndSlug = ([build, slug]: [
  Codeship.Build.Build,
  Heroku.Slug.Slug,
]): TaskEither<string, Bundle> => {
  if (!slug.commit) {
    return left(
      "Cannot create a deployable from a Heroku Slug without a commit sha.",
    );
  }

  if (!build.commit_sha) {
    return left(
      "Cannot create a deployable from a Codeship Build without a commit sha.",
    );
  }

  return flow(
    Github.Comparison.getComparison,
    map((comparison) => ({
      targets: [appName],
      comparison,
      codeshipBuild: build,
    })),
  )(slug.commit, build.commit_sha);
};

/**
 * isDeployable :: Bundle -> Boolean
 *
 * A bundle is deployable if it is only ahead of (not behind) the current slug.
 */
export const isDeployable = (bundle: Bundle): boolean =>
  Github.Comparison.isOnlyAhead(bundle.comparison);

/**
 * byQueuedAt :: Ord Bundle
 *
 * This is a way of ordering bundles; specifically, this is a way of ordering bundles by their
 * queued at date (and time).
 *
 * And Ord is an object that has a compare method. Some functions, like Array's sortBy function,
 * expect to be given an Ord or a list of Ords that it can use to do it's work.
 *
 * Read more about Ord here: https://dev.to/gcanti/getting-started-with-fp-ts-ord-5f1e
 */
export const byQueuedAt = ord.contramap<Date, Bundle>(
  ordDate,
  (bundle: Bundle) => new Date(bundle.codeshipBuild.queued_at || 0),
);
