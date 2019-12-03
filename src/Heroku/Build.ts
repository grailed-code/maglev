import { flow, constant, not } from "fp-ts/lib/function";
import {
  TaskEither,
  right,
  map,
  chain,
  fromPredicate,
} from "fp-ts/lib/TaskEither";
import { any } from "../Array.Extra";
import { Request } from "../Request";
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

interface CreateParams {
  source_blob: SourceBlob;
}

const buildCreateParams = (commitSha: string): CreateParams => ({
  source_blob: {
    url: Github.API.tarURL,
    version: commitSha,
  },
});

/**
 * create :: String -> String -> Task String Build
 *
 * Returns a task of a Heroku build on the given app for the given sha.
 */
// export const create = (app: string): ((s: string) => Request<Build>) =>
//   flow(
//     buildCreateParams,
//     (params) => API.post<CreateParams, Build>(`/apps/${app}/builds`, params),
//     map((res) => res.data),
//   );

/**
 * create :: String -> String -> Task String Build
 *
 * A fake implementation of the create function. We'll use this while we test Maglev to make sure
 * that we're not actually deploying.
 */
export const create = (app: string) => (sha: string): Request<Build> =>
  right({
    app: {
      id: app,
    },
    buildpacks: null,
    created_at: new Date().toDateString(),
    id: "fake build",
    output_stream_url: "fake out put stream url",
    release: null,
    slug: null,
    source_blob: {
      url: "fake source blob url",
    },
    stack: "fake stack",
    status: "succeeded",
    updated_at: new Date().toDateString(),
    user: {
      email: "fake email",
      id: "fake user",
    },
  });

/**
 * all :: String -> TaskEither String (Array Build)
 *
 * Returns a task of an array of the 30 recent builds for the given Heroku app.
 */
export const all = flow(
  (app: string) => API.get<Array<Build>>(`/apps/${app}/builds`),
  map((res) => res.data),
);

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
const checkForPendingBuilds = (app: string): TaskEither<string, string> =>
  flow(
    all,
    chain(
      fromPredicate(
        not(any(isPending)),
        constant("There is currently an active build."),
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
