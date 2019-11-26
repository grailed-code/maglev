import { map } from "fp-ts/lib/TaskEither";
import { flow } from "fp-ts/lib/function";
import * as API from "./API";
import * as Block from "./Block";

const FAMILY = "chat";

export interface Attachment {
  blocks: Array<Block.Messages>;
}

export interface PostMessageArgs {
  channel: string;
  text: string;
  as_user?: boolean;
  attachments?: Array<Attachment>;
  blocks?: Array<Block.Messages>;
  icon_emoji?: string;
  icon_url?: string;
  link_names?: boolean;
  mrkdwn?: boolean;
  parse?: string;
  reply_broadcast?: boolean;
  thread_ts?: string;
  unfurl_links?: boolean;
  unfurl_media?: boolean;
  username?: string;
}

export interface Message {
  text: string;
  username: string;
  bot_id: string;
  attachments: Array<Attachment>;
  type: string;
  subtype: string;
  ts: string;
}

export interface PostMessageResponse {
  ok: boolean;
  chanel: string;
  ts: string;
  message: Message;
}

export const postMessage = flow(
  (args: PostMessageArgs) =>
    API.post<PostMessageArgs, PostMessageResponse>(
      `/${FAMILY}.postMessage`,
      args,
    ),
  map((res) => res.data),
);
