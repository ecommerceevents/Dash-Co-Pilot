import { useEffect, useState } from "react";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";

interface Props {
  text: string;
  prompt: string;
  onResponse: (response: string) => void;
  onError: (error: string) => void;
}
export default function ChatGptStreaming({ text, prompt, onResponse, onError }: Props) {
  const [response, setResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    onResponse(response);
  }, [onResponse, response]);

  async function onClick() {
    setResponse("");
    setIsLoading(true);
    const response = await fetch("/api/ai/openai/chatgpt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
      }),
    });

    if (!response.ok) {
      const jsonBody = await response.text();
      onError(response.statusText + ": " + jsonBody);
      setIsLoading(false);
      return;
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      onError("No data");
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setResponse((prev) => prev + chunkValue);
    }
    setIsLoading(false);
  }

  return (
    <ButtonSecondary disabled={isLoading} onClick={onClick}>
      {text}
    </ButtonSecondary>
  );
}
