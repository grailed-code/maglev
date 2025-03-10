import * as Array from "fp-ts/lib/Array";
import * as Either from "fp-ts/lib/Either";
import { flow, constant } from "fp-ts/lib/function";
import * as Task from "fp-ts/lib/Task";
import * as TaskEither from "fp-ts/lib/TaskEither";
import * as CircleCI from "./CircleCI";
import { get, getArray } from "./Env";
import * as Deploy from "./Deploy";
import * as Heroku from "./Heroku";
import * as Slack from "./Slack";
import * as Notifier from "./Notifier";
import { zipFill } from "./Tuple.Extra";
import { log } from "./Logger";
import MaglevError from "./MaglevError";

if (!/true/i.test(get("TRAIN_IS_RUNNING")))
  throw new Error("🚨 TRAIN IS NOT RUNNING!");

const [leader, ...followers] = getArray("HEROKU_APP_NAME");

/**
 * buildPairsToDeployBundles :: Array (Tuple CircleCI.Build Heroku.Build.Build) -> TaskEither String (Array Deploy.Bundle.Bundle)
 *
 * Converts the given array of CircleCI build / Heroku build pairs into an array of deploy bundles,
 * wrapped in a TaskEither because there are some async operations that need to happen.
 *
 * First, we iterate over all of the pairs, attempting to create a deploy bundle for each.
 * At this point, we will have an array of TaskEithers. We want to end up with a single TaskEither
 * that contains an array, basically we want to invert the structure to make it easier to work with:
 *
 *   Have: Array (TaskEither e a)
 *   Want: TaskEither e (Array a)
 *
 * Usually, we would use array.sequence(taskEither) to accomplish this; that is almost identical to
 * Promise.all. Similar to Promise.all, array.sequence(taskEither) will ignore the result of *all*
 * of the TaskEithers if any one of them is a Left.
 *
 * Unfortunately for us, this isn't the behavior we want! If the attempt to create a deploy bundle
 * for any one build/build pair fails, that's okay. We want to filter those failures out and keep
 * the successful ones around, not lose everything.
 *
 * We model this by using array.sequence(task) which does the following:
 *
 *  array.sequence(task) :: Array (Task (Either e a))
 *                       -> Task (Array (Either e a))
 *
 * Now, we are still able to work with a single Task, which is __much__ nicer, without losing all
 * of the successful deploy bundles. With Array.rights we can remove all of the failed deploy
 * bundle creations and get an array of the values of the successful ones:
 *
 *   Task.map(Array.rights) :: Task (Array (Either e Bundle))
 *                          -> Task (Array Bundle)
 *
 * We do still, however, really want to end up with that TaskEither (even though we know this
 * function can never fail) becuase it will make it easier to work with in our main function.
 *
 * For that, we can wrap the entire array in one big Either:
 *
 *   Task.map(Either.right) :: Task (Array Bundle)
 *                          -> Task (Either e (Array Bundle))
 *
 * To be clear, `TaskEither e a` is the exact same thing as `Task (Either e a)`, I broke it out
 * with the parenthesis to make the explaination more clear.
 */
const buildPairsToDeployBundles = flow(
  Array.map(Deploy.Bundle.fromBuilds),
  Array.array.sequence(Task.task),
  Task.map(Array.rights),
  Task.map(Either.right),
);

/**
 * buildsToDeployBundles :: Array CircleCI.Build -> TaskEither String (Array Deploy.Bundle.Bundle)
 *
 * Converts the given array of CircleCI builds to an array of deploy bundles, wrapped in a
 * TaskEither because there are a bunch of async operations that need to happen.
 *
 * We start by getting the current build from the primary Heroku app we want to target.
 * Then, we pair that build with each of the given CircleCI builds.
 * Finally, we convert all of the CircleCI build / Heroku build pairs into deploy bundles.
 */
const buildsToDeployBundles = (builds: Array<CircleCI.Build | CircleCI.Build>) =>
  flow(
    Heroku.Build.getMostRecent,
    TaskEither.map((build) => zipFill([builds, build])),
    TaskEither.chain(buildPairsToDeployBundles),
  )(leader);

/**
 * getBestDeployBundle :: Array Deploy.Bundle.Bundle -> TaskEither String Deploy.Bundle.Bundle
 *
 * We return a TaskEither to keep it more consistent with the rest of the main function.
 */
const getBestDeployBundle = flow(
  Deploy.getBestBundle,
  TaskEither.fromOption<MaglevError>(
    constant({
      kind: "Deploy.Bundle.NotFoundError",
      message: "No deployable builds found.",
    }),
  ),
);

/**
 * main :: () -> TaskEither String Slack.Chat.PostMessageResponse
 *
 * This function returns a task of all of the work we need to do to deploy the best green build
 * from CircleCI, if it exists, to Heroku and notify the team in Slack.
 */
const main = flow(
  CircleCI.getAllGreenSourceBuilds,
  TaskEither.chain(buildsToDeployBundles),
  TaskEither.chain(getBestDeployBundle),
  TaskEither.chain(Deploy.fromBundle),
  TaskEither.bimap(log, log),
  TaskEither.bimap(Notifier.deployError, Notifier.deploySuccess),
  TaskEither.toUnion,
  Task.chain(Slack.Chat.postMessage),
  TaskEither.bimap(log, log),
);

/**
 * mainTask :: TaskEither String Slack.Chat.PostMessageResponse
 *
 * This is a task of the entire main program. When it is called, it will kick off all of the work
 * that has been prepared in all of the above code.
 */
const mainTask = main();

// https://www.youtube.com/watch?v=kT5UlRy80cw
mainTask();
