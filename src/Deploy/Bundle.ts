import { flow } from "fp-ts/lib/function";
import { ord, ordDate } from "fp-ts/lib/Ord";
import { TaskEither, left, map } from "fp-ts/lib/TaskEither";
import { RequestError } from "../Request";
import * as CircleCI from "../CircleCI";
import * as Env from "../Env";
import * as Github from "../Github";
import * as Heroku from "../Heroku";

const appNames = Env.getArray("HEROKU_APP_NAME");

export interface Bundle {
  targets: Array<string>;
  comparison: Github.Comparison.Comparison;
  circleCIBuild: CircleCI.Build;
}

export interface CreateError {
  kind: "Deploy.Bundle.CreateError";
  message: string;
  stack?: string;
  circleCIBuild: CircleCI.Build;
  herokuBuild?: Heroku.Build.Build;
  herokuSlug?: Heroku.Slug.Slug;
}

export interface NotFoundError {
  kind: "Deploy.Bundle.NotFoundError";
  message: string;
  stack?: string;
}

/**
 * fromBuildAndSlug :: Tuple CircleCI.Build Heroku.Slug.Slug -> TaskEither String Bundle
 *
 * Returns a task of a deploy bundle created from the given CircleCI build and Heroku slug. In
 * order to create a bundle, we need three things:
 *
 * - a set of targets, declared in the environment (for now);
 * - a build from CircleCI that we might want to deploy; and
 * - a git comparison of the commit from the CircleCI build against the commit from the Heroku slug.
 *
 * If the Heroku slug does not have a commit, we immediately return a Left of an error message.
 *
 * In Either (and TaskEither), left is traditionally where we put errors. Functions like map, chain,
 * etc. will only operate on the right side of the Either. If we need to map functions over the
 * left side, we can use functions like bimap or mapLeft.
 *
 * Similarly to the Heroku slug, if the CircleCI build doesn't have a commit sha, we immediately
 * return a Left of an error message.
 *
 * Once we know that we have commit shas from the Heroku slug and the CircleCI build, we can make
 * task of a request to get a comparison of those shas from Github. With that task in hand, we can
 * map over it to create a task of the created deploy bundle.
 */
export const fromBuildAndSlug = ([build, slug]: [
  CircleCI.Build,
  Heroku.Slug.Slug,
]): TaskEither<RequestError | CreateError, Bundle> => {
  if (!slug.commit) {
    return left({
      kind: "Deploy.Bundle.CreateError",
      message:
        "Cannot create a Deploy Bundle from a Heroku Slug without a commit sha.",
      circleCIBuild: build,
      herokuSlug: slug,
    });
  }

  if (!build.commit_sha) {
    return left({
      kind: "Deploy.Bundle.CreateError",
      message:
        "Cannot create a Deploy Bundle from a CircleCI Build without a commit sha.",
      circleCIBuild: build,
      herokuSlug: slug,
    });
  }

  return flow(
    Github.Comparison.getComparison,
    map((comparison) => ({
      targets: appNames,
      comparison,
      circleCIBuild: build,
    })),
  )(slug.commit, build.commit_sha);
};

export const fromBuilds = ([circleCIBuild, herokuBuild]: [
  CircleCI.Build,
  Heroku.Build.Build,
]): TaskEither<RequestError | CreateError, Bundle> => {
  if (!herokuBuild.source_blob.version) {
    return left({
      kind: "Deploy.Bundle.CreateError",
      message:
        "Cannot create a Deploy Bundle from a Heroku Build without a source version.",
      circleCIBuild,
      herokuBuild,
    });
  }

  if (!circleCIBuild.commit_sha) {
    return left({
      kind: "Deploy.Bundle.CreateError",
      message:
        "Cannot create a Deploy Bundle from a CircleCI Build without a commit sha.",
      circleCIBuild,
      herokuBuild,
    });
  }

  return flow(
    Github.Comparison.getComparison,
    map((comparison) => ({
      targets: appNames,
      comparison,
      circleCIBuild,
    })),
  )(herokuBuild.source_blob.version, circleCIBuild.commit_sha);
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
  (bundle: Bundle) => new Date(bundle.circleCIBuild.queued_at || 0),
);
