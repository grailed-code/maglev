import { left, right, chain } from "fp-ts/lib/Either";
import { flow } from "fp-ts/lib/function";
import { map } from "fp-ts/lib/TaskEither";
import { Request } from "../Request";
import * as API from "./API";
import { CommitReference } from "./Commit";

interface File {
  sha: string;
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  blob_url: string;
  raw_url: string;
  contents_url: string;
  patch: string;
}

export interface Comparison {
  url: string;
  html_url: string;
  permalink_url: string;
  diff_url: string;
  patch_url: string;
  base_commit: CommitReference;
  merge_base_commit: CommitReference;
  status: string;
  ahead_by: number;
  behind_by: number;
  total_commits: number;
  commits: Array<CommitReference>;
  files: Array<File>;
}

export const isBehind = ({ behind_by }: Comparison): boolean => behind_by > 0;

export const isAhead = ({ ahead_by }: Comparison): boolean => ahead_by > 0;

/**
 * isOnlyAhead :: Comparison -> Boolean
 *
 * In git, a given sha (or branch) can be behind or ahead of any other sha; it is also possible for
 * a sha to be both behind **and** ahead of another sha, if they both have commits the other is
 * missing.
 *
 * We care about whether the head sha is ahead of the base sha, i.e. head has commits base doesn't
 * have, and we care about whether the head sha is not behind the base sha, i.e. head has all of
 * the commits base has.
 */
export const isOnlyAhead = (c: Comparison): boolean =>
  isAhead(c) && !isBehind(c);

/**
 * getComparison :: (String, String) -> TaskEither String Github.Comparison
 *
 * Returns a task of a Github Comparison between a base sha and a head sha.
 */
export const getComparison = (
  base: string,
  head: string,
): Request<Comparison> =>
  flow(
    () => API.get<Comparison>(`/compare/${base}...${head}`),
    map((res) => res.data),
  )();
