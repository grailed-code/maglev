import * as Env from "../Env";
import { request } from "../Request";

const userName = Env.get("GITHUB_USER_NAME");
const token = Env.get("GITHUB_ACCESS_TOKEN");
const owner = Env.get("GITHUB_OWNER");
const repo = Env.get("GITHUB_REPO");
const sourceBranch = Env.get("SOURCE_BRANCH");

const baseURL = `https://${userName}:${token}@api.github.com/repos/${owner}/${repo}`;

const headers = {
  Authorization: `token ${token}`,
  Accept: "application/vnd.github.v3+json",
};

/**
 * get :: String -> TaskEither String (AxiosResponse a)
 *
 * Returns a task of an authenticated GET request to the Github API.
 */
export const get = <A>(url: string) =>
  request<A>({
    url,
    baseURL,
    headers,
  });

export const tarURL = (sha: string): string =>
  `${baseURL}/tarball/${sha}`;
