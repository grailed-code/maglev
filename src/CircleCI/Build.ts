import { ApplicativePar, map as taskEitherMap, chain } from "fp-ts/lib/TaskEither";
import { filter, sequence, map as arrayMap } from "fp-ts/lib/Array";
import { flow, pipe } from "fp-ts/lib/function";
import { Request } from "../Request";
import * as Pipeline from "./Pipeline";
import * as Workflow from "./Workflow";

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

const createBuildFromPipelineAndWorkflow = ([pipeline, workflow]: [Pipeline.Pipeline, Workflow.Workflow]): Build => ({
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

const pipelineAndWorkflow = (pipeline: Pipeline.Pipeline): Request<[Pipeline.Pipeline, Workflow.Workflow]> => {
  return pipe(
    Workflow.getWorkflow(pipeline.id),
    taskEitherMap((workflow) => [pipeline, workflow])
  );
};

export const isSuccessful = ({ status }: Build) => status === "success";

export const getAll: (branch: string) => Request<Array<Build>> = flow(
  (branch) => Pipeline.getAllPipelines(branch), // Request<Array<Pipeline>>
  taskEitherMap(filter(Pipeline.isCreated)), // Request<Array<Pipeline>>
  taskEitherMap(arrayMap(pipelineAndWorkflow)), // Request<Array<Request<[Pipeline, Workflow]>>>
  chain(sequence(ApplicativePar)), // Request<Array<[Pipeline, Workflow]>>
  taskEitherMap(arrayMap(createBuildFromPipelineAndWorkflow)), // Request<Array<Build>>
);
