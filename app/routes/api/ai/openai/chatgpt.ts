import { ActionFunctionArgs } from "@remix-run/node";
import OpenAIService from "~/modules/ai/lib/OpenAIStream";
import { OpenAIDefaults } from "~/modules/ai/utils/OpenAIDefaults";
import { createMetrics } from "~/modules/metrics/services/.server/MetricTracker";

// doesn't work :/
// export const config = {
//   runtime: "edge",
// };

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { time, getServerTimingHeader } = await createMetrics({ request, params }, "ai.openai.chatgpt");
  const { prompt, max_tokens } = (await time(request.json(), "request.json")) as {
    prompt?: string;
    max_tokens?: number;
  };

  if (!prompt) {
    return new Response("No prompt in the request", { status: 400, headers: getServerTimingHeader() });
  }

  const stream = await time(
    OpenAIService.chatCompletionStream({
      model: OpenAIDefaults.model,
      messages: [{ role: "assistant", content: prompt }],
      stream: true,
      n: 1,
      temperature: OpenAIDefaults.temperature,
      max_tokens,
    }),
    "OpenAIService.chatCompletionStream"
  );
  return new Response(stream, { headers: getServerTimingHeader() });
};
