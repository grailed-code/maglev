import { sequenceT } from "fp-ts/lib/Apply";
import { array, map as arrayMap, rights } from "fp-ts/lib/Array";
import { fromOption } from "fp-ts/lib/Either";
import { flow, constant } from "fp-ts/lib/function";
import { chain as optionChain } from "fp-ts/lib/Option";
import { Task, task, map as taskMap } from "fp-ts/lib/Task";
import {
  TaskEither,
  taskEither,
  map as taskEitherMap,
  right,
  chain as taskEitherChain,
  bimap as taskEitherBimap,
} from "fp-ts/lib/TaskEither";
import { get } from "./Env";
import {
  Build as CodeshipBuild,
  chooseBestBuild,
  getSha,
  requestAllGreenMasterBuilds,
} from "./Codeship";
import { Slug, createBuild, requestCurrentSlug } from "./Heroku";
import { isDeployable } from "./Github";
import { tap } from "./Function";

const appName = get("HEROKU_APP_NAME");

const log: <A>(a: A) => A = tap((a) => console.log(a));

const validateComparison = ([build, slug]: [CodeshipBuild, Slug]) => {
  if (!slug.commit || !build.commit_sha) return right(build);

  return flow(
    isDeployable,
    taskEitherMap(constant(build)),
  )(slug.commit, build.commit_sha);
};

const zipFill = <A, B>([as, b]: [Array<A>, B]) =>
  arrayMap((a: A): [A, B] => [a, b])(as);

const arraySequenceTask = array.sequence(task);

const deployableBuilds: (
  a: [Array<CodeshipBuild>, Slug],
) => Task<Array<CodeshipBuild>> = flow(
  zipFill,
  arrayMap(validateComparison),
  arraySequenceTask,
  taskMap(rights),
);

const sequenceTaskEither = (
  bs: TaskEither<string, Array<CodeshipBuild>>,
  s: TaskEither<string, Slug>,
) => sequenceT(taskEither)(bs, s);

const getBestSha = flow(
  deployableBuilds,
  taskMap(chooseBestBuild),
  taskMap(optionChain(getSha)),
  taskMap(fromOption(constant("Could not find a best sha."))),
);

const main = () => {
  const builds = requestAllGreenMasterBuilds();
  const slug = requestCurrentSlug(appName);

  const task = flow(
    sequenceTaskEither,
    taskEitherChain(getBestSha),
    taskEitherChain(createBuild(appName)),
    taskEitherBimap(log, log),
  )(builds, slug);

  task();
};

main();
