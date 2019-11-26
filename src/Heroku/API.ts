import * as Env from "../Env";
import { request } from "../Request";

const token = Env.get("HEROKU_ACCESS_TOKEN");

const baseURL = "https://api.heroku.com";

/**
 * get :: (String, ?String) -> TaskEither String (AxiosResponse a)
 *
 * Returns a task of an authenticated GET request to the Heroku API. Optionally, we can pass a Range string that will be used by Heroku to sort or filter the results.
 */
export const get = <A>(url: string, range?: string) =>
  request<A>({
    url,
    baseURL,
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.heroku+json; version=3",
      Range: range || "",
    },
  });

/**
 * post :: (String, d) -> TaskEither String (AxiosResponse a)
 *
 * Returns a task of an authenticated POST request to the Heroku API.
 */
export const post = <D, A>(url: string, data: D) =>
  request<A>({
    url,
    baseURL,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.heroku+json; version=3",
    },
    data,
  });
