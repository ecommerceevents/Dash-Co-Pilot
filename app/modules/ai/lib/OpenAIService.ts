import OpenAI from "openai";
import { OpenAIDefaults } from "../utils/OpenAIDefaults";

function getClient(apiKey?: string) {
  if (apiKey === undefined) {
    apiKey = process.env.OPENAI_API_KEY;
  }
  return new OpenAI({ apiKey });
}

async function createChatCompletion({
  role = "assistant",
  model = OpenAIDefaults.model,
  prompt,
  temperature,
  max_tokens,
  user,
  stream,
  apiKey,
}: {
  prompt: string;
  model?: string;
  temperature?: number;
  role?: "user" | "assistant" | "system";
  max_tokens?: number;
  user?: string;
  stream?: boolean;
  apiKey?: string;
}): Promise<string[]> {
  const openai = getClient(apiKey);
  const response = await openai.chat.completions
    .create({
      model,
      messages: [{ role, content: prompt }],
      n: 1,
      temperature,
      max_tokens,
      user,
      stream,
    })
    .catch((reason) => {
      const message = reason?.response?.data?.error?.message;
      if (message) {
        throw Error(message);
      }
      throw Error(reason);
    });
  if ("choices" in response === false) {
    return [];
  }
  if (response.choices.length === 0) {
    return [];
  }
  return response.choices
    .filter((f) => f.message?.content)
    .map((f) => {
      return f.message?.content ?? "";
    });
}

async function generateImages({ prompt, n, size, apiKey }: { prompt: string; n: number; size: "256x256" | "512x512" | "1024x1024"; apiKey?: string }) {
  const openai = getClient(apiKey);
  const response = await openai.images.generate({
    prompt,
    n: 1,
    size,
  });
  if (!response.data || response.data.length === 0) {
    return [];
  }
  const imageUrls = response.data.map((f) => f.url ?? "");

  return imageUrls;
}

export default {
  createChatCompletion,
  generateImages,
};
