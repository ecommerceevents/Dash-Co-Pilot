export type SelectOptionsDisplay =
  | "Name"
  | "Value"
  | "Color"
  | "NameAndValue"
  | "ValueAndName"
  | "ValueNameAndColor"
  | "NameValueAndColor"
  | "NameAndColor"
  | "ValueAndColor"
  | "ColorWithTitle";
export const SelectOptionsFormats: { name: string; value: SelectOptionsDisplay }[] = [
  { name: "Name", value: "Name" },
  { name: "Value", value: "Value" },
  { name: "Color", value: "Color" },
  { name: "Name and Value", value: "NameAndValue" },
  { name: "Value and Name", value: "ValueAndName" },
  { name: "Value, Name and Color", value: "ValueNameAndColor" },
  { name: "Name, Value and Color", value: "NameValueAndColor" },
  { name: "Name and Color", value: "NameAndColor" },
  { name: "Value and Color", value: "ValueAndColor" },
  { name: "Color with Title", value: "ColorWithTitle" },
];
