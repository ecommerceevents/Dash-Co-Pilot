import { Form, useActionData, useSubmit, useNavigation } from "@remix-run/react";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import InputText from "~/components/ui/input/InputText";
import ErrorBanner from "~/components/ui/banners/ErrorBanner";
import InputSelect from "~/components/ui/input/InputSelect";
import OpenAIService from "~/modules/ai/lib/OpenAIService";
import ServerError from "~/components/ui/errors/ServerError";
import { ActionFunctionArgs, json } from "@remix-run/node";

type ActionData = {
  error?: string;
  images?: string[];
};
export const action = async ({ request }: ActionFunctionArgs) => {
  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  if (action !== "generateImages") {
    const prompt = form.get("prompt")?.toString() ?? "";
    try {
      const images = await OpenAIService.generateImages({
        prompt,
        n: 1,
        size: "512x512",
      });
      // const data = await PromptService.fakeData({ numberOfResults });
      const data: ActionData = {
        images,
      };
      return json(data);
    } catch (e: any) {
      return json({ error: e.message }, { status: 400 });
    }
  } else {
    return json({ error: "Invalid action" }, { status: 400 });
  }
};

export default function Index() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const submit = useSubmit();

  const formRef = useRef<HTMLFormElement>(null);
  const refContent = useRef<HTMLTextAreaElement>(null);

  const [type, setType] = useState("ChatGPT");
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const isPrompting = isLoading || navigation.state === "submitting";
    if (!isPrompting) {
      // formRef.current?.reset();
      formRef.current?.focus();
      setPrompt("");
    }
  }, [isLoading, navigation.state]);

  const onGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const form = new FormData(e.currentTarget);

    if (form.get("type") === "DALL-E") {
      submit(form, {
        method: "post",
      });
    } else if (form.get("type") === "ChatGPT") {
      setContent("");
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
        setError(response.statusText + ": " + jsonBody);
        setIsLoading(false);
        return;
      }

      // This data is a ReadableStream
      const data = response.body;
      if (!data) {
        return;
      }

      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        if (refContent.current) {
          refContent.current.scrollTop = refContent.current.scrollHeight;
        }
        setContent((prev) => prev + chunkValue);
      }
      setIsLoading(false);
    }
  };

  function isBusy() {
    return isLoading || navigation.state === "submitting";
  }
  return (
    <div>
      <div className="container mx-auto h-[calc(100vh-100px)] max-w-5xl space-y-3 overflow-hidden px-4 py-6">
        <div>
          <h1 className="text-2xl font-bold">OpenAI - ChatGPT + DALL-E</h1>
          {/* Add input for prompt with a Generate button */}
          <Form onSubmit={onGenerate}>
            <div className="flex space-x-2">
              <InputSelect
                className="w-40"
                title="Type"
                name="type"
                disabled={isBusy()}
                required
                options={[
                  {
                    name: "ChatGPT",
                    value: "ChatGPT",
                  },
                  {
                    name: "DALL-E",
                    value: "DALL-E",
                  },
                ]}
                value={type}
                setValue={(e) => setType(e?.toString() ?? "")}
              />
              <InputText
                autoFocus
                className="w-full"
                title="Prompt"
                type="text"
                name="prompt"
                placeholder={type === "ChatGPT" ? "I don't remember previous messages..." : "Type something and I'll generate an image..."}
                disabled={isBusy()}
                minLength={1}
                required
                value={prompt}
                setValue={setPrompt}
              />
            </div>
          </Form>
        </div>

        {error ? (
          <ErrorBanner title="Error" text={error} />
        ) : type === "ChatGPT" ? (
          <div>
            <textarea
              ref={refContent}
              className={clsx("h-full w-full rounded-md border border-gray-300 px-4 py-2", { "cursor-not-allowed opacity-50": isBusy() })}
              disabled={isBusy()}
              rows={18}
              defaultValue={content}
            />
          </div>
        ) : type === "DALL-E" ? (
          <div className="overflow-y-scroll">
            <div className="mx-auto">
              <div role="status" className="space-y-8 md:flex md:items-center md:space-x-8 md:space-y-0">
                <img
                  alt="Generated with DAll-E"
                  src={
                    !actionData?.images || actionData?.images?.length === 0
                      ? "https://via.placeholder.com/512x512?text=Prompt%20something..."
                      : actionData?.images[0]
                  }
                  className=" flex h-[calc(100vh-250px)] w-full items-center justify-center rounded bg-gray-50 object-contain"
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
