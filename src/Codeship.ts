import { sortBy, reverse, head, filter } from "fp-ts/lib/Array";
import { flow } from "fp-ts/lib/function";
import { fromNullable } from "fp-ts/lib/Option";
import { ord, ordDate } from "fp-ts/lib/Ord";
import { TaskEither, map } from "fp-ts/lib/TaskEither";
import * as Env from "./Env";
import { Request, request } from "./Request";

const baseURL = "https://api.codeship.com/v2";
const organizationId = Env.get("CODESHIP_ORGANIZATION_ID");
const projectId = Env.get("CODESHIP_PROJECT_ID");
const token = Env.get("CODESHIP_ACCESS_TOKEN");

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

export const getSha = (build: Build) => fromNullable(build.commit_sha);

const byQueuedAt = ord.contramap(
  ordDate,
  (build: Build) => new Date(build.queued_at || 0),
);

export const chooseBestBuild = flow(
  sortBy([byQueuedAt]),
  reverse,
  head,
);

const apiRequest = <A>(url: string) =>
  request<A>({
    url,
    baseURL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

const requestBuilds: (
  orgId: string,
  projId: string,
) => TaskEither<string, Array<Build>> = flow(
  (orgId, projId) =>
    apiRequest<{ builds: Array<Build> }>(
      `/organizations/${orgId}/projects/${projId}/builds`,
    ),
  map((res) => res.data.builds),
);

export const requestAllGreenMasterBuilds: () => Request<Array<Build>> = flow(
  () => requestBuilds(organizationId, projectId),
  map(filter(({ branch }) => branch === "master")),
  map(filter(({ status }) => status === "success")),
);
