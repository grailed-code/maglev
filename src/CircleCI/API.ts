import * as Env from "../Env";
import { request } from "../Request";

const circleciToken = Env.get("CIRCLECI_TOKEN");
const baseUrl = "https://circleci.com/api/v2/"

export const getWorkflow = <A>(pipelineId: string) => {
  return request<A>(
    {
      baseURL: baseUrl,
      url: `/workflow/${pipelineId}`,
      auth: {
        username: circleciToken,
        password: "",
      }
    }
  );
}

export const getAllPipelines = <A>(branch: string) => {
  return request<A>(
    {
      baseURL: baseUrl,
      url: "/project/gh/grailed-code/grailed/pipeline",
      params: { branch: branch },
      auth: {
        username: circleciToken,
        password: "",
      }
    }
  );
}
