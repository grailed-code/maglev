import { flow } from "fp-ts/lib/function";
import { right, map } from "fp-ts/lib/TaskEither";
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
