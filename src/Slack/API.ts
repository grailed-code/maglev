import * as Env from "../Env";
import { request } from "../Request";

const baseURL = "https://slack.com/api";
const token = Env.get("SLACK_API_TOKEN");

export const post = <D, A>(url: string, data: D) =>
  request<A>({
    url,
    baseURL,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-type": "application/json",
    },
    data,
  });
