import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { Form } from "@remix-run/react";
import { ChatMessageDto } from "../dtos/ChatMessageDto";
import ExclamationTriangleIconFilled from "~/components/ui/icons/ExclamationTriangleIconFilled";
import PdfViewer from "~/components/ui/pdf/PdfViewer";
import DownloadIcon from "~/components/ui/icons/DownloadIcon";
import { EntitiesApi } from "~/utils/api/.server/EntitiesApi";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import { marked } from "marked";

interface Props {
  messages: ChatMessageDto[];
  onSendMessage: (message: string) => void;
  onDeleteMessage?: (message: ChatMessageDto, index: number) => void;
  className?: string;
  entitiesMetadata?: {
    allEntities: EntityWithDetails[];
    routes: EntitiesApi.Routes | undefined;
  };
  scrollToBottom?: boolean;
  defaultMessage?: string;
  disabled?: boolean;
}
export default function Chat({
  messages,
  onSendMessage,
  onDeleteMessage,
  className = "h-[calc(100vh-100px)]",
  entitiesMetadata,
  scrollToBottom = true,
  defaultMessage,
  disabled,
}: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [inputMessage, setInputMessage] = useState(defaultMessage || "");

  useEffect(() => {
    if (scrollToBottom) {
      // @ts-ignore
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, scrollToBottom]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setInputMessage("");
    onSendMessage(inputMessage);
  }

  // function handleDeleteMessage(message: ChatMessageDto, index: number) {
  //   if (confirm("Are you sure you want to delete this message?")) {
  //     if (onDeleteMessage) {
  //       onDeleteMessage(message, index);
  //     }
  //   }
  // }

  function formatTime(date: Date) {
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  }

  return (
    <Form onSubmit={onSubmit} className={clsx(className, "relative flex flex-col space-y-4 overflow-hidden bg-gray-50")}>
      <div className="flex-grow overflow-auto px-4 py-2">
        <div className="flex-1 space-y-2">
          {messages.map((message, idx) => (
            <div
              key={idx}
              // ref={idx === messages.length - 1 ? messagesEndRef : undefined}
              className={clsx("flex", message.position === "right" ? "justify-end" : "justify-start")}
            >
              <div
                className={clsx(
                  "group relative max-w-lg rounded-lg border px-2 py-1.5 text-gray-800 shadow",
                  message.position === "right" ? "border-theme-200 bg-theme-100" : "border-gray-200 bg-white"
                )}
              >
                <div>
                  {"loading" in message.data && <div className="pr-12">...</div>}
                  {"error" in message.data && (
                    <div className="flex items-center space-x-1 pr-12">
                      <ExclamationTriangleIconFilled className="h-4 w-4 flex-shrink-0 text-red-600" />
                      <div className="sm:text-sm">{message.data.error}</div>
                    </div>
                  )}
                  {"text" in message.data && <div className="prose pr-12 sm:text-sm" dangerouslySetInnerHTML={{ __html: marked(message.data.text) }} />}
                  {"file" in message.data && <FileBubble file={message.data.file} />}

                  <div className="absolute bottom-1 right-2 text-xs text-gray-500">{formatTime(new Date(message.createdAt))}</div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="border-border sticky bottom-0 w-full border-t bg-gray-50 p-4">
        <div className="relative flex items-center">
          <input
            disabled={disabled}
            autoFocus
            type="text"
            name="message"
            id="message"
            autoComplete="off"
            className={clsx(
              "focus:ring-theme-600 block w-full rounded-md border-0 py-3 pr-14 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6",
              disabled && "cursor-not-allowed opacity-75"
            )}
            placeholder="Type a message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            required
          />
          <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
            <button type="submit" className="inline-flex items-center rounded border border-gray-200 px-1 font-sans text-xs text-gray-400">
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Form>
  );
}

function FileBubble({
  file,
  className,
}: {
  file: {
    file: string;
    name: string;
    type: string;
  };
  className?: string;
}) {
  const onDownload = (media: { file: string; name: string; type: string }) => {
    const downloadLink = document.createElement("a");
    downloadLink.href = media.file;
    downloadLink.download = media.name;
    downloadLink.click();
  };
  return (
    <div className={clsx(className, "space-y-5")}>
      <div>
        {file.type === "application/pdf" ? (
          <PdfViewer
            file={file.file}
            fileName={file.name}
            size={{
              height: 280,
              width: 300,
            }}
          />
        ) : (
          <div>
            <button
              type="button"
              onClick={() => onDownload(file)}
              className={
                "flex items-center space-x-1 border-b border-transparent text-xs text-gray-600 hover:border-dashed hover:border-gray-300 hover:text-gray-800"
              }
            >
              <div className="font-normal">{file.name}</div>
              <DownloadIcon className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
      <div></div>
    </div>
  );
}
