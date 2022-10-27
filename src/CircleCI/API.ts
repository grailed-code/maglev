import * as Env from "../Env";
import { request } from "../Request";

const circleciToken = Env.get("CIRCLECI_TOKEN");
const baseUrl = "https://circleci.com/api/v2/"


export const get = <A>(url: string, params?: Object) => {
  return request<A>(
    {
      baseURL: baseUrl,
      url: url,
      params: params,
      auth: {
        username: circleciToken,
        password: "",
      }
    }
  );
}
