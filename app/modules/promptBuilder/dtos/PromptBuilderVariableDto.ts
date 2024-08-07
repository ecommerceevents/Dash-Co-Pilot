export type PromptBuilderVariableDto = {
  type: "text" | "row" | "tenant" | "user" | "promptFlow";
  name: string;
};
