import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  Method,
} from "axios";
import { TaskEither, tryCatch } from "fp-ts/lib/TaskEither";

export interface RequestError {
  kind: "RequestError";
  message: string;
  stack?: string;
  status?: string;
  url?: string;
  method?: Method;
}

const requestError = ({
  config,
  code,
  request,
  response,
  stack,
  message,
}: AxiosError): RequestError => ({
  kind: "RequestError",
  message,
  stack,
  status: code,
  url: config.url,
  method: config.method,
});

export type Request<A> = TaskEither<RequestError, A>;

export const request = <A>(
  opts: AxiosRequestConfig,
): Request<AxiosResponse<A>> => tryCatch(() => axios(opts), requestError);
