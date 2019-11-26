import { PlainText, ConfirmationDialog } from "./Composition";

export interface Button {
  type: "button";
  text: PlainText;
  action_id: string;
  url?: string;
  value?: string;
  style?: "primary" | "danger";
  confirm?: ConfirmationDialog;
}

export interface DatePicker {
  type: "datepicker";
  action_id: string;
  placeholder?: PlainText;
  initial_date?: string;
  confirm?: ConfirmationDialog;
}

export interface Image {
  type: "image";
  image_url: string;
  alt_text: string;
}

// NOTE: We aren't using any of the below elements, so I skipped adding their types. If you want to
// use them, please fill out their types from here:
// -> https://api.slack.com/reference/block-kit/block-elements
// [Evan 2019-11-26]

export interface MultiSelectMenu {}

export interface MultiSelectMenuWithExternalDataSource {}

export interface MultiSelectMenuWithUserList {}

export interface MultiSelectMenuWithConversationsList {}

export interface MultiSelectMenuWithChannelsList {}

export interface OverflowMenu {}

export interface PlainTextInput {}

export interface RadioButtonGroup {}

export interface SelectMenuWithStaticOptions {}

export interface SelectMenuWithExternalDataSource {}

export interface SelectMenuWithUserList {}

export interface SelectMenuWithConversationsList {}

export interface SelectMenuWithChannelsList {}

export type Section =
  | Button
  | DatePicker
  | Image
  | MultiSelectMenu
  | MultiSelectMenuWithExternalDataSource
  | MultiSelectMenuWithUserList
  | MultiSelectMenuWithConversationsList
  | MultiSelectMenuWithChannelsList
  | OverflowMenu
  | PlainTextInput
  | RadioButtonGroup
  | SelectMenuWithStaticOptions
  | SelectMenuWithExternalDataSource
  | SelectMenuWithUserList
  | SelectMenuWithConversationsList
  | SelectMenuWithChannelsList;

export type Actions =
  | Button
  | DatePicker
  | OverflowMenu
  | PlainTextInput
  | RadioButtonGroup
  | SelectMenuWithStaticOptions
  | SelectMenuWithExternalDataSource
  | SelectMenuWithUserList
  | SelectMenuWithConversationsList
  | SelectMenuWithChannelsList;

export type Input =
  | DatePicker
  | MultiSelectMenu
  | MultiSelectMenuWithExternalDataSource
  | MultiSelectMenuWithUserList
  | MultiSelectMenuWithConversationsList
  | MultiSelectMenuWithChannelsList
  | PlainTextInput
  | RadioButtonGroup
  | SelectMenuWithStaticOptions
  | SelectMenuWithExternalDataSource
  | SelectMenuWithUserList
  | SelectMenuWithConversationsList
  | SelectMenuWithChannelsList;
