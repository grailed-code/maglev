import { pipe } from "fp-ts/lib/function";
import { chain, right, left } from "fp-ts/lib/TaskEither";
import { get } from "./API";
import { Request } from "../Request";


export interface Workflow {
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

interface WorkflowResponse {
  items: Array<Workflow>;
  next_page_token: string | null;
}

export const getWorkflow = (pipelineId: string): Request<Workflow> => {
  return pipe(
    get<WorkflowResponse>(`/pipeline/${pipelineId}/workflow`),
    chain((res) => { 
      const workflow = res.data.items[0] 
      if (!workflow) {
        return left(
          {
            kind: "RequestError",
            message: `Could not find a workflow for pipelineID: ${pipelineId}`,
          }
        )
      }
      return right(workflow);
    } 
    ) 
  );
};
