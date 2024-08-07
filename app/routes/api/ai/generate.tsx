import { ActionFunctionArgs } from "@remix-run/node";
import OpenAIService, { ChatGPTMessage } from "~/modules/ai/lib/OpenAIStream";
import { createMetrics } from "~/modules/metrics/services/.server/MetricTracker";

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { time, getServerTimingHeader } = await createMetrics({ request, params }, "ai.generate");
  let { prompt, systemContent, model, temperature, max_tokens } = (await request.json()) as {
    prompt?: string;
    systemContent?: string;
    model?: string;
    temperature?: number;
    max_tokens?: number;
  };

  if (!prompt) {
    return new Response("No prompt in the request", { status: 400, headers: getServerTimingHeader() });
  }

  prompt = prompt.replace(/\n/g, " ").replace(/\/$/, "").slice(0, 5000);

  if (!prompt) {
    return new Response("No prompt", { status: 400, headers: getServerTimingHeader() });
  }

  if (!model) {
    model = "gpt-4";
  }
  if (!temperature) {
    temperature = 0.7;
  }
  if (!max_tokens) {
    max_tokens = undefined;
  }
  // eslint-disable-next-line no-console
  console.log({ prompt, systemContent });

  // if (!systemContent) {
  //   systemContent =
  //     "You are an AI writing assistant that continues existing text based on context from prior text. " +
  //     "Give more weight/priority to the later characters than the beginning ones. Make sure to construct complete sentences.";
  // }
  const messages: ChatGPTMessage[] = [];
  if (systemContent) {
    messages.push({
      role: "system",
      content: systemContent,
    });
  }
  messages.push({
    role: "user",
    content: prompt,
  });
  // eslint-disable-next-line no-console
  console.log({ model, temperature, messages: messages.map((m) => m.content.padEnd(20, " ")).join(" | "), max_tokens });
  const stream = await time(
    OpenAIService.chatCompletionStream({
      model,
      temperature,
      messages,
      stream: true,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      n: 1,
      max_tokens,
    }),
    "OpenAIService.chatCompletionStream"
  );
  return new Response(stream, { headers: getServerTimingHeader() });
};
