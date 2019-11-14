import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { TaskEither, tryCatch } from "fp-ts/lib/TaskEither";

export type Request<A> = TaskEither<string, A>;

const onError = ({ config, message, response }: AxiosError) => {
  const lines: Array<string> = [];

  if (config && config.url) lines.push(config.url);

  lines.push(message);

  if (response && response.data && response.data.message)
    lines.push(response.data.message);

  return lines.join("\n-> ");
};

export const request = <A>(
  opts: AxiosRequestConfig,
): Request<AxiosResponse<A>> => tryCatch(() => axios(opts), onError);
