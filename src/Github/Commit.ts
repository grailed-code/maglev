import { User } from "./User";
import { Verification } from "./Verification";

interface Author {
  name: string;
  email: string;
  date: string;
}

interface Sha {
  url: string;
  sha: string;
}

export interface Commit {
  url: string;
  author: Author;
  committer: Author;
  message: string;
  tree: Sha;
  comment_count: number;
  verification: Verification;
}

export interface CommitReference {
  url: string;
  sha: string;
  node_id: string;
  html_url: string;
  comments_url: string;
  commit: Commit;
  author: User;
  committer: User;
  parents: Array<Sha>;
}
