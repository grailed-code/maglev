import { map as taskMap } from "fp-ts/lib/Task";
import { map as taskEitherMap } from "fp-ts/lib/TaskEither";
import { left, right, chain as eitherChain } from "fp-ts/lib/Either";
import { flow } from "fp-ts/lib/function";
import * as Env from "./Env";
import { Request, request } from "./Request";

const baseURL = "https://api.github.com";
const owner = "grailed-code";
const repo = "grailed";
const token = Env.get("GITHUB_ACCESS_TOKEN");

interface User {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
}

interface Author {
  name: string;
  email: string;
  date: string;
}

type InvalidVerificationReason =
  | "expired_key"
  | "not_signing_key"
  | "gpgverify_error"
  | "gpgverify_unavailable"
  | "unsigned"
  | "unknown_signature_type"
  | "no_user"
  | "unverified_email"
  | "bad_email"
  | "unknown_key"
  | "invalid";

interface InvalidVerification {
  verified: false;
  reason: InvalidVerificationReason;
  signature: null;
  payload: null;
}

interface ValidVerification {
  verified: true;
  reason: "valid";
  signature: string;
  payload: string;
}

type Verification = ValidVerification | InvalidVerification;

interface Sha {
  url: string;
  sha: string;
}

interface Commit {
  url: string;
  author: Author;
  committer: Author;
  message: string;
  tree: Sha;
  comment_count: number;
  verification: Verification;
}

interface CommitReference {
  url: string;
  sha: string;
  node_id: string;
  html_url: string;
  comments_url: string;
  commit: Commit;
  author: User;
  committer: User;
  parents: Array<Sha>;
}

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

export const validateBehindBy = (comparison: Comparison) =>
  comparison.behind_by === 0
    ? right(comparison)
    : left("Build is behind the current slug.");

export const validateAheadBy = (comparison: Comparison) =>
  comparison.ahead_by !== 0
    ? right(comparison)
    : left("Build is not ahead of the current slug.");

const apiRequest = <A>(url: string) =>
  request<A>({
    url,
    baseURL,
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

export const compare = (base: string, head: string): Request<Comparison> =>
  flow(
    () =>
      apiRequest<Comparison>(
        `/repos/${owner}/${repo}/compare/${base}...${head}`,
      ),
    taskEitherMap((res) => res.data),
  )();

export const isDeployable = flow(
  compare,
  taskMap(eitherChain(validateBehindBy)),
  taskMap(eitherChain(validateAheadBy)),
);
