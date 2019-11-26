import * as Env from "../Env";
import { request } from "../Request";

const token = Env.get("GITHUB_ACCESS_TOKEN");
const owner = Env.get("GITHUB_OWNER");
const repo = Env.get("GITHUB_REPO");

const baseURL = `https://api.github.com/repos/${owner}/${repo}`;

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

export const tarURL: string = `${baseURL}/tarball/master?access_token=${token}`;
