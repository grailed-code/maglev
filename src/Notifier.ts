import { map, takeLeft } from "fp-ts/lib/Array";
import { flow } from "fp-ts/lib/function";
import { Comparison, Commit } from "./Github";
import { Deploy } from "./Deploy";
import { Block, Chat } from "./Slack";
import { get } from "./Env";


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
      `<${commit.html_url}|${commit.commit.message.split("\n")[0]}>`,
    ].join(" "),
  });

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

export const deploySuccess = (deploy: Deploy) =>
  Chat.postMessage({
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
