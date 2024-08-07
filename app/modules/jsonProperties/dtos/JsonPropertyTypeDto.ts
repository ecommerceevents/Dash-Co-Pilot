import { JsonValue } from "./JsonPropertiesValuesDto";

export const JsonPropertyTypes = [
  {
    value: "string",
    // name: "String",
  },
  {
    value: "number",
    // name: "Number",
  },
  {
    value: "boolean",
    // name: "Boolean",
  },
  {
    value: "image",
    // name: "Image",
  },
  {
    value: "date",
    // name: "Date",
  },
  {
    value: "select",
    // name: "Select",
  },
  {
    value: "multiselect",
    // name: "Multi-select",
  },
  {
    value: "wysiwyg",
    // name: "WYSIWYG",
  },
  {
    value: "monaco",
    // name: "Monaco Editor",
  },
  {
    value: "content",
    // name: "Content",
  },
] as const;

export type JsonPropertyType = (typeof JsonPropertyTypes)[number]["value"];

export type JsonPropertyDto = {
  name: string;
  title: string;
  type: JsonPropertyType;
  required: boolean;
  defaultValue?: JsonValue;
  options?: { name: string; value: string }[] | null;
  group?: string;
  order?: number;
};
