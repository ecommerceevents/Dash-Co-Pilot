import { OpenAIDefaults } from "../utils/OpenAIDefaults";
// import LangChainService from "./LangChainService";
import OpenAIService from "./OpenAIService";

export async function createChatCompletion(data: {
  prompt: string;
  model: string;
  temperature?: number;
  role?: "user" | "assistant" | "system";
  max_tokens?: number;
  user?: string;
  stream?: boolean;
}): Promise<string[]> {
  const provider = OpenAIDefaults.getModelProvider(data.model);
  // eslint-disable-next-line no-console
  console.log("Executing createChatCompletion with provider: ", provider);
  if (provider === "OpenAI") {
    try {
      const response = await OpenAIService.createChatCompletion(data);
      // eslint-disable-next-line no-console
      console.log({ provider, response });
      return response;
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.log({ provider, error });
      throw Error(error);
    }
  } else if (provider === "LangChain") {
    // try {
    //   data.model = OpenAIDefaults.getModelName(data.model);
    //   const response = await LangChainService.createChatCompletion(data);
    //   // eslint-disable-next-line no-console
    //   console.log({ provider, response });
    //   return response;
    // } catch (error: any) {
    //   // eslint-disable-next-line no-console
    //   console.log({ provider, error });
    //   throw Error(error);
    // }
  }
  throw Error("Invalid provider in model: " + data.model);
}

export default {
  createChatCompletion,
};
