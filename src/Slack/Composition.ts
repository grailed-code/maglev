export interface PlainText {
  type: "plain_text";
  text: string;
  emoji?: boolean;
  verbatim?: boolean;
}

export interface MarkdownText {
  type: "mrkdwn";
  text: string;
  emoji?: boolean;
  verbatim?: boolean;
}

export type Text = PlainText | MarkdownText;

export interface ConfirmationDialog {
  title: PlainText;
  text: Text;
  confirm: PlainText;
  deny: PlainText;
}

export interface Option {
  text: PlainText;
  value: string;
  url?: string;
}

export interface OptionGroup {
  label: PlainText;
  options: Array<Option>;
}
