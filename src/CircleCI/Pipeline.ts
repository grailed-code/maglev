import { pipe } from "fp-ts/lib/function";
import { map as taskEitherMap } from "fp-ts/lib/TaskEither";
import { get } from "./API";
import { Request } from "../Request";

interface PipelineError {
  type: string;
  message: string;
};

export interface Pipeline {
  id: string;
  project_slug: string;
  updated_at: string;
  created_at: string;
  number: string;
  state: string;
  errors: Array<PipelineError>;
  trigger_parameters: any;
  trigger: {
    type: string;
    received_at: string;
    actor: {
      login: string;
      avatar_url: string;
    }
  };
  vcs: {
    provider_name: string;
    target_repository_url: string;
    branch: string | null;
    review_id: string;
    review_url: string;
    revision: string;
    tag: string;
    origin_repository_url: string; 
    commit: {
      subject: string;
      body: string;
    }
  }
}


interface AllPipelinesResponse {
  items: Array<Pipeline>;
  next_page_token: string | null;
}


export const isCreated = ({ state }: Pipeline) => state === "created";

export const getAllPipelines = (branch: string): Request<Array<Pipeline>> => {
  return pipe(
    get<AllPipelinesResponse>("/project/gh/grailed-code/grailed/pipeline", { branch: branch }),
    taskEitherMap((res) => res.data.items) // Request<Array<Pipeline>>
  );
};
