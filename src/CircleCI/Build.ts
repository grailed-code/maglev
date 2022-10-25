import { ApplicativePar, flatten, map as taskEitherMap, chain } from "fp-ts/lib/TaskEither";
import { filterMap, filter, sequence, map as arrayMap } from "fp-ts/lib/Array";
import { flow, pipe } from "fp-ts/lib/function";
import { Request } from "../Request";
import * as API from "./API";
import { AxiosResponse } from "axios";


interface Workflow {
  id: string;
  name: string;
  project_slug: string;
  status: string;
  pipeline_id: string;
  canceled_by: string;
  error_by: string;
  tag: string;
  started_by: string;
  pipeline_number: string;
  created_at: string;
  stopped_at: string;
}

interface PipelineError {
  type: string;
  message: string;
};

interface Pipeline {
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
  next_page_token: string;
}


export interface Build {
  project_uuid: string | null;
  commit_message: string | null;
  status: string | null;
  branch: string | null;
  uuid: string | null;
  queued_at: string | null;
  commit_sha: string | null;
  finished_at: string | null;
  allocated_at: string | null;
}

export const isCreated = ({ state }: Pipeline) => state === "created";
export const isSuccessful = ({ status }: Workflow) => status === "success";

const pipelineToWorkflow = (pipeline: Pipeline): Request<[Pipeline, Workflow]> => {
  const workflow = API.getWorkflow<Workflow>(pipeline.id);
  return taskEitherMap((res: AxiosResponse<Workflow>): [Pipeline, Workflow] => [pipeline, res.data])(workflow);
};

const createBuildFromPipelineAndWorkflow = ([pipeline, workflow]: [Pipeline, Workflow]): Build => ({
  project_uuid: pipeline.project_slug,
  commit_message: pipeline.vcs.commit.subject,
  status: workflow.status,
  branch: pipeline.vcs.branch,
  uuid: workflow.id,
  queued_at: workflow.created_at,
  commit_sha: pipeline.vcs.revision,
  finished_at: workflow.stopped_at,
  allocated_at: null,
});

export const getAll: (branch: string) => Request<Array<Build>> = flow(
  (branch) => API.getAllPipelines<AllPipelinesResponse>(branch), // Request<AxiosResponse<AllPipelinesResponse>>
  taskEitherMap((res) => res.data.items), // Request<Array<Pipeline>>
  taskEitherMap(filter(isCreated)), // Request<Array<Pipeline>>
  taskEitherMap(arrayMap(pipelineToWorkflow)), // Request<Array<Request<[Pipeline, Workflow]>>>
  chain(sequence(ApplicativePar)), // Request<Array<[Pipeline, Workflow]>>
  taskEitherMap(filter(([pipeline, workflow]) => isSuccessful(workflow))), // Request<Array<[Pipeline, Workflow]>>
  taskEitherMap(arrayMap(createBuildFromPipelineAndWorkflow)), // Request<Array<Build>>
);
