import { map, takeLeft } from "fp-ts/lib/Array";
import { flow } from "fp-ts/lib/function";
import { Comparison, Commit } from "./Github";
import { Deploy } from "./Deploy";
import { Block, Chat } from "./Slack";
import { get } from "./Env";
import MaglevError from "./MaglevError";

const introBlock = (targets: Array<string>) =>
  Block.section({
    text: [
      "🚄 The Grailed Platform Deploy Train is leaving the station.",
      `📍 The destination for this train is: *${targets.join(", ")}*.`,
    ].join("\n"),
  });

const passengerListHeaderBlock = Block.section({
  text: "*Passenger List:*",
});

const commitRefBlock = (commit: Commit.CommitReference) =>
  Block.section({
    text: [
      "📝",
      `${commit.author.login}`,
      `<${commit.html_url}|${escapeCommitMessage(
        commit.commit.message.split("\n")[0],
      )}>`,
    ].join(" "),
  });

// https://api.slack.com/reference/surfaces/formatting#escaping
const escapeCommitMessage = (message: string) =>
  message
    .replace("&lt;", "&amp;")
    .replace("<", "&lt;")
    .replace(">", "&gt;");

const MAX_COMMIT_COUNT = 15;

const passengerListBlocks: (
  c: Comparison.Comparison,
) => Array<Block.Messages> = flow(
  ({ commits }) => commits,
  map(commitRefBlock),
  takeLeft(MAX_COMMIT_COUNT),
);

const linkToCommitsBlock = (c: Comparison.Comparison) =>
  Block.context([
    {
      type: "mrkdwn",
      text: [
        `There are ${c.commits.length} total commits.`,
        `<${c.html_url}|See the entire comparison here.>`,
      ].join(" "),
    },
  ]);

export const deploySuccess = (deploy: Deploy): Chat.PostMessageArgs => ({
  channel: get("NOTIFICATIONS_CHANNEL"),
  text: "",
  as_user: false,
  blocks: [
    Block.divider,
    introBlock(deploy.targets),
    Block.divider,
    passengerListHeaderBlock,
    ...passengerListBlocks(deploy.comparison),
    linkToCommitsBlock(deploy.comparison),
  ],
});

export const deployError = (error: MaglevError): Chat.PostMessageArgs => {
  switch (error.kind) {
    // NOTE: We don't want to post anything for the deploy bundle not found error.
    case "Deploy.Bundle.NotFoundError":
      return {
        channel: get("NOTIFICATIONS_CHANNEL"),
        text: "",
      };

    case "Deploy.Bundle.CreateError":
    case "Heroku.Build.CreateError":
    case "Heroku.Build.NotFoundError":
    case "Heroku.Release.NotFoundError":
    case "Heroku.Slug.NotFoundError":
    case "RequestError":
      console.log(error);

      return {
        channel: get("NOTIFICATIONS_CHANNEL"),
        text: "",
        as_user: false,
        blocks: [
          Block.section({
            text: "🚨🚨🚨 🚄 Maglev Deploy Error 🚨🚨🚨",
          }),
          Block.section({
            text: error.message,
          }),
          Block.divider,
          Block.context([
            {
              type: "mrkdwn",
              text: "There might be more details in the logs!",
            },
          ]),
        ],
      };
  }
};
