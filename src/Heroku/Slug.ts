import { flow, constant } from "fp-ts/lib/function";
import { fromNullable, Option } from "fp-ts/lib/Option";
import { fromOption, map, chain } from "fp-ts/lib/TaskEither";
import { Request, RequestError } from "../Request";
import * as API from "./API";
import * as Release from "./Release";

export interface Slug {
  blob: {
    method: string;
    url: string;
  };
  buildpack_provided_description: string | null;
  checksum: string | null;
  commit: string | null;
  commit_description: string | null;
  created_at: string;
  id: string;
  process_types: Object;
  size: number | null;
  stack: {
    id: string;
    name: string;
  };
  updated_at: string;
}

/**
 * getById :: String -> String -> TaskEither String Slug
 */
export const getById = (appName: string): ((slugId: string) => Request<Slug>) =>
  flow(
    (slugId: string) => API.get<Slug>(`/apps/${appName}/slugs/${slugId}`),
    map((res) => res.data),
  );

export interface NotFoundError {
  kind: "Heroku.Slug.NotFoundError";
  message: string;
  stack?: string;
  app: string;
}

type GetCurrentError = RequestError | Release.NotFoundError | NotFoundError;

/**
 * getCurrent :: String -> TaskEither String Slug
 *
 * In order to get the current slug from a Heroku app, we need to get the most recent release. From
 * that release, we can make a second request for a current slug.
 */
export const getCurrent = (appName: string): Request<Slug> =>
  flow(
    () => Release.getMostRecent(appName),
    map((r) => fromNullable(r.slug ? r.slug.id : null)),
    chain<GetCurrentError, Option<string>, string>(
      fromOption(
        constant({
          kind: "Heroku.Slug.NotFoundError",
          message: "No current slug available.",
          app: appName,
        }),
      ),
    ),
    chain(getById(appName)),
  )();
