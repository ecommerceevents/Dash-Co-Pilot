const models = [
  { name: "GPT-4 Turbo", value: "gpt-4-1106-preview" },
  { name: "GPT-4", value: "gpt-4" },
  { name: "GPT-3.5 Turbo", value: "gpt-3.5-turbo" },
] as const;
export type AIModel = (typeof models)[number]["value"];
export const OpenAIDefaults = {
  model: "gpt-4-1106-preview",
  temperature: 0.7,
  maxTokens: 0,
  models,
  getModelName: (model: string) => {
    return model.replace("langchain-", "");
  },
  getModelProvider: (model: string) => {
    if (model.startsWith("langchain")) {
      return "LangChain";
    } else {
      return "OpenAI";
    }
  },
};
