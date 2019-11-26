import * as Element from "./Element";
import { PlainText, Text } from "./Composition";

export interface Section {
  type: "section";
  text: Text;
  block_id?: string;
  fields?: Array<Text>;
  accessory?: Element.Section;
}
export const section = ({
  text,
  format = "mrkdwn",
  fields,
  accessory,
}: {
  text: string;
  format?: Text["type"];
  fields?: Array<Text>;
  accessory?: Element.Section;
}): Section => ({
  type: "section",
  text: {
    type: format,
    text,
  },
  fields,
  accessory,
});

export interface Divider {
  type: "divider";
  block_id?: string;
}
export const divider: Divider = { type: "divider" };

export interface Image {
  type: "image";
  image_url: string;
  alt_text: string;
  title?: PlainText;
  block_id?: string;
}

export interface Actions {
  type: "actions";
  elements: Array<Element.Actions>;
  block_id?: string;
}

export interface Context {
  type: "context";
  elements: Array<Element.Image | Text>;
  block_id?: string;
}
export const context = (elements: Array<Element.Image | Text>): Context => ({
  type: "context",
  elements,
});

export interface Input {
  type: "input";
  label: PlainText;
  element: Element.Input;
  block_id?: string;
  hint?: PlainText;
  optional?: boolean;
}

export interface File {
  type: "file";
  external_id: string;
  source: "remote";
  block_id?: string;
}

export type Messages = Actions | Context | Divider | File | Image | Section;

export type Modals = Actions | Context | Divider | Image | Input | Section;

export type HomeTabs = Actions | Context | Divider | Image | Section;
