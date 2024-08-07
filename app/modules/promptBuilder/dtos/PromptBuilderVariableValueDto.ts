export type PromptBuilderVariableValueDto = {
  type: "text" | "row" | "tenant" | "user" | "promptFlow";
  name: string;
  value: string;
};
