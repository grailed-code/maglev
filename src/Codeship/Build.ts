import { flow } from "fp-ts/lib/function";
import { map } from "fp-ts/lib/TaskEither";
import { Request } from "../Request";
import * as API from "./API";

export interface Build {
  project_uuid: string | null;
  commit_message: string | null;
  status: string | null;
  branch: string | null;
  uuid: string | null;
  queued_at: string | null;
  username: string | null;
  ref: string | null;
  commit_sha: string | null;
  finished_at: string | null;
  allocated_at: string | null;
  organization_uuid: string | null;
  links: {
    steps?: string | null;
    services?: string | null;
    pipelines?: string | null;
  };
}

interface AllBuildsResponse {
  builds: Array<Build>;
}

/**
 * getAll :: String -> Request (Array Build)
 *
 * Returns a task of an array of the builds for the given project id.
 */
export const getAll: (projId: string) => Request<Array<Build>> = flow(
  (projId) => API.get<AllBuildsResponse>(`/projects/${projId}/builds`),
  map((res) => res.data.builds),
);

export const isMasterBranch = ({ branch }: Build) => branch === "master";

export const isSuccessful = ({ status }: Build) => status === "success";
