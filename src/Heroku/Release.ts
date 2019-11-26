import { head } from "fp-ts/lib/Array";
import { flow, constant } from "fp-ts/lib/function";
import { map, chain, fromOption } from "fp-ts/lib/TaskEither";
import { Request } from "../Request";
import * as API from "./API";

export interface Release {
  addon_plan_names: string;
  app: {
    id: string;
    name: string;
  };
  created_at: string;
  current: boolean;
  description: string;
  id: string;
  output_stream_url: string | null;
  slug: null | { id: string };
  status: string;
  updated_at: string;
  user: {
    email: string;
    id: string;
  };
  version: number;
}

/**
 * getMostRecent :: String -> Task String Release
 *
 * Returns a task of the most recent Heroku release from the given app.
 *
 * The /apps/:name/releases endpoint can be sorted and filtered by a given range. In this case, we
 * want to get the most recent release, so we set the order to be descending and limit the request
 * to maximum of 1 result.
 *
 * We will always get back an array of releases, even if we specify a max of 1, so we need to grab
 * the head of the array of releases.
 *
 * Array.head returns an Option of whatever is in the array, in our case a Release. In our program,
 * we only want to consider this operation as successful if we actually have a Release at the end,
 * if our Option of a Release resolves to a None, we can convert that into a failing TaskEither.
 *
 * In any case, we are returning a TaskEither of a Release, not a TaskEither of an Option of a Release.
 */
export const getMostRecent: (appName: string) => Request<Release> = flow(
  (appName: string) =>
    API.get<Array<Release>>(
      `/apps/${appName}/releases`,
      "version; order=desc, max=1",
    ),
  map((res) => res.data),
  map(head),
  chain(fromOption(constant("No Heroku Release Found"))),
);
