export const PromptFlowVariableTypes = [
  { name: "Text", value: "text" },
  { name: "Number", value: "number" },
] as const;
export type PromptFlowVariableType = (typeof PromptFlowVariableTypes)[number]["value"];
