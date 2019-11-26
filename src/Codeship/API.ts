import { flow } from "fp-ts/lib/function";
import * as TaskEither from "fp-ts/lib/TaskEither";
import * as Env from "../Env";
import { request } from "../Request";

const username = Env.get("CODESHIP_USERNAME");
const password = Env.get("CODESHIP_PASSWORD");
const orgId = Env.get("CODESHIP_ORGANIZATION_ID");

const baseURL = `https://api.codeship.com/v2`;

interface Organization {}

interface Authentication {
  access_token: string;
  organizations: Array<Organization>;
  expires_at: number;
}

/**
 * authenticate :: () -> Request (AxiosResponse Authentication)
 *
 * Returns a task of a POST request to authenticate the credentials in the environment.
 */
const authenticate = () =>
  request<Authentication>({
    url: "/auth",
    baseURL,
    method: "POST",
    auth: {
      username,
      password,
    },
  });

/**
 * get :: String -> Request (AxiosResponse a)
 *
 * Returns a task of an authenticated GET request to the given url of the Codeship API.
 *
 * We include the organization and organization id in the base URL because the two main sections of the Codeship API, Projects and Builds, use the organization prefix on all of their endpoints. Authentication is the only section of the API that doesn't.
 */
export const get = <A>(url: string) =>
  flow(
    authenticate,
    TaskEither.map((res) => res.data.access_token),
    TaskEither.chain((token) =>
      request<A>({
        url,
        baseURL: `${baseURL}/organizations/${orgId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    ),
  )();
