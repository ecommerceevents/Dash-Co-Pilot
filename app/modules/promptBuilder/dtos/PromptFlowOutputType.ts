export const PromptFlowOutputTypes = [
  { name: "Update Current Row", value: "updateCurrentRow" },
  { name: "Create Row", value: "createRow" },
  { name: "Create Parent Row", value: "createParentRow" },
  { name: "Create Child Row", value: "createChildRow" },
] as const;
export type PromptFlowOutputType = (typeof PromptFlowOutputTypes)[number]["value"];
