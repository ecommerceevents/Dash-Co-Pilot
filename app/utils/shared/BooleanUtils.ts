export type BooleanFormatType = "yesNo" | "trueFalse" | "enabledDisabled" | "onOff" | "activeInactive";
export const BooleanFormats: { name: string; value: BooleanFormatType }[] = [
  { name: "Yes/No", value: "yesNo" },
  { name: "True/False", value: "trueFalse" },
  { name: "Enabled/Disabled", value: "enabledDisabled" },
  { name: "On/Off", value: "onOff" },
  { name: "Active/Inactive", value: "activeInactive" },
];
