import { Form, useSearchParams } from "@remix-run/react";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ErrorBanner from "~/components/ui/banners/ErrorBanner";
import WarningBanner from "~/components/ui/banners/WarningBanner";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import ChatGptIcon from "~/components/ui/icons/ai/ChatGptIcon";
import CheckIcon from "~/components/ui/icons/CheckIcon";
import ExclamationTriangleIcon from "~/components/ui/icons/ExclamationTriangleIcon";
import InputText from "~/components/ui/input/InputText";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import Tabs from "~/components/ui/tabs/Tabs";
import { PageBlock } from "~/modules/pageBlocks/components/blocks/PageBlock";
import { PageBlockDto } from "~/modules/pageBlocks/dtos/PageBlockDto";
import AIPageBuilderService from "../services/AIPageBuilderService";
import toast from "react-hot-toast";
import { PageConfiguration } from "~/modules/pageBlocks/dtos/PageConfiguration";
import PageBlockPromptUtils from "../prompts/PageBlockPromptUtils";

interface Props {
  page?: PageConfiguration;
  block: PageBlockDto;
  onGenerated: (block: PageBlockDto) => void;
  onLoading?: (isLoading: boolean) => void;
  onError?: (error: string) => void;
}
export default function ChatGptGeneratePageBlock({ page, block, onGenerated, onError, onLoading }: Props) {
  const { t } = useTranslation();

  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedTab, selectTab] = useState(0);

  const [response, setResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finishedBlock, setFinishedBlock] = useState<PageBlockDto>();

  const [isSettingParameters, setIsSettingParameters] = useState(false);

  const [parameters, setParameters] = useState<string>(PageBlockPromptUtils.getDefaultPrompt(page, block));

  useEffect(() => {
    let aiGenerateBlocks = searchParams.get("aiGenerateBlocks");
    if (aiGenerateBlocks) {
      let decoded = decodeURIComponent(aiGenerateBlocks);
      setParameters(decoded);
      searchParams.delete("aiGenerateBlocks");
      setSearchParams(searchParams, {
        preventScrollReset: true,
      });
      onClick(decoded);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  useEffect(() => {
    if (finishedBlock) {
      onGenerated(finishedBlock);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finishedBlock]);

  useEffect(() => {
    if (onLoading) {
      onLoading(isLoading);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  useEffect(() => {
    if (response && !isLoading) {
      let finishedBlock = AIPageBuilderService.parseChatGptContentToBlock(response);
      if (finishedBlock) {
        setFinishedBlock(finishedBlock);
        selectTab(2);
      } else {
        setError("Could not parse response");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, response]);

  async function onClick(info: string) {
    let prompt = AIPageBuilderService.getBlockPrompt({
      block,
      info,
    });
    if (!prompt) {
      setError("Block not supported");
      toast.error("Block not supported");
    }
    // eslint-disable-next-line no-console
    console.log({ prompt });
    setResponse("");
    setIsLoading(true);
    setError(null);
    setFinishedBlock(undefined);
    const response = await fetch("/api/ai/openai/chatgpt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        role: "assistant",
        max_tokens: PageBlockPromptUtils.maxTokens,
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
      setError("No data");
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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    // setIsSettingParameters(false);
    selectTab(1);
    onClick(parameters);
  }

  return (
    <>
      <ButtonSecondary
        className={clsx(isLoading && "base-spinner", error && "bg-red-100 text-red-500", finishedBlock && "bg-green-100 text-green-500")}
        onClick={() => setIsSettingParameters(true)}
      >
        {error ? (
          <>
            <ExclamationTriangleIcon className="h-4 w-4" />
          </>
        ) : finishedBlock ? (
          <>
            <CheckIcon className="h-4 w-4" />
          </>
        ) : (
          <>
            <ChatGptIcon className="h-4 w-4" />
          </>
        )}
      </ButtonSecondary>

      <SlideOverWideEmpty title="ChatGPT Block Generator" open={isSettingParameters} onClose={() => setIsSettingParameters(false)}>
        <div>
          <Tabs
            asLinks={false}
            selectedTab={selectedTab}
            onSelected={(index) => selectTab(index)}
            tabs={[{ name: `Generate` }, { name: `Response` }, { name: `Generated Block` }]}
          />
          <div className="mt-3">
            {selectedTab === 0 && (
              <Form onSubmit={handleSubmit} className="space-y-3 text-gray-800">
                <InputText
                  title="Context"
                  editor="monaco"
                  editorLanguage="markdown"
                  editorOptions={{
                    wordWrap: "on",
                  }}
                  value={parameters}
                  editorSize="lg"
                  setValue={(value) => setParameters(value)}
                />
                <div className="flex justify-end space-x-2">
                  <ButtonSecondary onClick={() => setIsSettingParameters(false)}>Cancel</ButtonSecondary>
                  <ButtonPrimary type="submit">Generate</ButtonPrimary>
                </div>
              </Form>
            )}
            {selectedTab === 1 && (
              <div className="space-y-2">
                {error && <ErrorBanner title={t("shared.error")} text={error} />}
                <InputText title="Response" editor="monaco" editorLanguage="markdown" value={response} setValue={() => {}} editorSize="lg" />
              </div>
            )}
            {selectedTab === 2 && (
              <div>
                {finishedBlock ? <PageBlock item={finishedBlock} /> : <WarningBanner title="No block generated" text="Please generate a block first" />}
              </div>
            )}
          </div>
        </div>
      </SlideOverWideEmpty>
    </>
  );
}
