import { head, filter } from "fp-ts/lib/Array";
import { flow, constant, not } from "fp-ts/lib/function";
import { Option } from "fp-ts/lib/Option";
import {
  TaskEither,
  map,
  chain,
  fromPredicate,
  fromOption,
} from "fp-ts/lib/TaskEither";
import { any } from "../Array.Extra";
import { Request, RequestError } from "../Request";
import * as Github from "../Github";
import * as API from "./API";

interface SourceBlob {
  checksum?: string | null;
  url: string;
  version?: string | null;
}

export interface Build {
  app: {
    id: string;
  };
  buildpacks: null | Array<{
    name: string;
    url: string;
  }>;
  created_at: string;
  id: string;
  output_stream_url: string;
  release: null | { id: string };
  slug: null | { id: string };
  source_blob: SourceBlob;
  stack: string;
  status: "failed" | "pending" | "succeeded";
  updated_at: string;
  user: {
    email: string;
    id: string;
  };
}

export const isPending = ({ status }: Build): boolean => status === "pending";
export const isFailed = ({ status }: Build): boolean => status === "failed";

interface CreateParams {
  source_blob: SourceBlob;
}

const buildCreateParams = (commitSha: string): CreateParams => ({
  source_blob: {
    url: Github.API.tarURL(commitSha),
    version: commitSha,
  },
});

/**
 * create :: String -> String -> Task String Build
 *
 * Returns a task of a Heroku build on the given app for the given sha.
 */
export const create = (app: string): ((s: string) => Request<Build>) =>
  flow(
    buildCreateParams,
    (params) => API.post<CreateParams, Build>(`/apps/${app}/builds`, params),
    map((res) => res.data),
  );

/**
 * all :: String -> TaskEither String (Array Build)
 *
 * Returns a task of an array of the 30 recent builds for the given Heroku app.
 */
export const all = flow(
  (app: string) => API.get<Array<Build>>(`/apps/${app}/builds`),
  map((res) => res.data),
);

export interface NotFoundError {
  kind: "Heroku.Build.NotFoundError";
  message: "No Heroku Build Found";
  stack?: string;
  app: string;
}

/**
 * getMostRecent :: String -> Task String Build
 *
 * Returns a task of the most recent Heroku build from the given app.
 *
 * The /apps/:name/builds endpoint can be sorted and filtered by a given range. In this case, we
 * want to get the most recent build, so we set the order to be descending and limit the request
 * to maximum of 1 result.
 *
 * We will always get back an array of builds, even if we specify a max of 1, so we need to grab
 * the head of the array of builds.
 *
 * Array.head returns an Option of whatever is in the array, in our case a build. In our program,
 * we only want to consider this operation as successful if we actually have a build at the end,
 * if our Option of a Build resolves to a None, we can convert that into a failing TaskEither.
 *
 * In any case, we are returning a TaskEither of a Build, not a TaskEither of an Option of a Build.
 */
export const getMostRecent = (
  appName: string,
): TaskEither<RequestError | NotFoundError, Build> =>
  flow(
    (appName: string) =>
      API.get<Array<Build>>(
        `/apps/${appName}/builds`,
        "created_at; order=desc, max=10",
      ),
    map((res) => res.data),
    map(filter(not(isFailed))),
    map(head),
    chain<RequestError | NotFoundError, Option<Build>, Build>(
      fromOption(
        constant({
          kind: "Heroku.Build.NotFoundError",
          message: "No Heroku Build Found",
          app: appName,
        }),
      ),
    ),
  )(appName);

export interface CreateError {
  kind: "Heroku.Build.CreateError";
  message: string;
  stack?: string;
  app: string;
}

/**
 * checkForPendingBuilds :: String -> TaskEither String String
 *
 * Checks to see if there are any pending builds for the given app. Returns the given app name in
 * the right side of the returned TaskEither.
 *
 * Here, we have a predicate function, `not(any(isPending))`, which returns true if none of the builds are pending. We use `TaskEither.fromPredicate` to base our return value on the result of the predicate function:
 *  - if the predicate is true, return the list of builds;
 *  - if the predicate is false, return the error message.
 */
const checkForPendingBuilds = (
  app: string,
): TaskEither<RequestError | CreateError, string> =>
  flow(
    all,
    chain<RequestError | CreateError, Array<Build>, Array<Build>>(
      fromPredicate(
        not(any(isPending)),
        constant({
          kind: "Heroku.Build.CreateError",
          message: "There is currently an active build.",
          app,
        }),
      ),
    ),
    map(constant(app)),
  )(app);

/**
 * safelyCreate :: String -> String -> TaskEither String Build
 *
 * Calls create after checking to see if there are any currently pending builds for the given app.
 */
export const safelyCreate = (app: string) => (sha: string): Request<Build> =>
  flow(
    checkForPendingBuilds,
    chain((app) => create(app)(sha)),
  )(app);
