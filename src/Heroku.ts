import {
  fromOption,
  map as taskEitherMap,
  chain as taskEitherChain,
} from "fp-ts/lib/TaskEither";
import { head } from "fp-ts/lib/Array";
import { fromNullable } from "fp-ts/lib/Option";
import { flow } from "fp-ts/lib/function";
import * as Env from "./Env";
import { Request, request } from "./Request";

const baseURL = "https://api.heroku.com";
const token = Env.get("HEROKU_ACCESS_TOKEN");

interface Release {
  addon_plan_names: string;
  app: {
    id: string;
    name: string;
  };
  created_at: string;
  current: boolean;
  description: string;
  id: string;
  output_stream_url: string | null;
  slug: null | { id: string };
  status: string;
  updated_at: string;
  user: {
    email: string;
    id: string;
  };
  version: number;
}

export interface Slug {
  blob: {
    method: string;
    url: string;
  };
  buildpack_provided_description: string | null;
  checksum: string | null;
  commit: string | null;
  commit_description: string | null;
  created_at: string;
  id: string;
  process_types: Object;
  size: number | null;
  stack: {
    id: string;
    name: string;
  };
  updated_at: string;
}

interface SourceBlob {
  checksum?: string | null;
  url: string;
  version?: string | null;
}

export interface Build {
  app: {
    id: string;
  };
  buildpacks: null | Array<{
    name: string;
    url: string;
  }>;
  created_at: string;
  id: string;
  output_stream_url: string;
  release: null | { id: string };
  slug: null | { id: string };
  source_blob: SourceBlob;
  stack: string;
  status: "failed" | "pending" | "succeeded";
  updated_at: string;
  user: {
    email: string;
    id: string;
  };
}

const get = <A>(url: string, range?: string) =>
  request<A>({
    url,
    baseURL,
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.heroku+json; version=3",
      Range: range || "",
    },
  });

const post = <D, A>(url: string, data: D) =>
  request<A>({
    url,
    baseURL,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.heroku+json; version=3",
    },
    data,
  });

const requestLastRelease: (appName: string) => Request<Release> = flow(
  (appName: string) =>
    get<Array<Release>>(
      `/apps/${appName}/releases`,
      "version; order=desc, max=1",
    ),
  taskEitherChain(
    flow(
      (res) => res.data,
      head,
      fromOption(() => "No Heroku Release Found"),
    ),
  ),
);

const requestSlug = (appName: string) => (slugId: string): Request<Slug> =>
  flow(
    () => get<Slug>(`/apps/${appName}/slugs/${slugId}`),
    taskEitherMap((res) => res.data),
  )();

export const requestCurrentSlug = (appName: string): Request<Slug> =>
  flow(
    () => requestLastRelease(appName),
    taskEitherMap((r) => fromNullable(r.slug ? r.slug.id : null)),
    taskEitherChain(fromOption(() => "No current slug available.")),
    taskEitherChain(requestSlug(appName)),
  )();

export const createBuild = (appName: string) => (
  commitSha: string,
): Request<Build> =>
  flow(
    () =>
      post<{ source_blob: SourceBlob }, Build>(`/apps/${appName}/builds`, {
        source_blob: {
          url: "https://github.com/grailed-code/grailed/archive/master.tar.gz",
          version: commitSha,
        },
      }),
    taskEitherMap((res) => res.data),
  )();
