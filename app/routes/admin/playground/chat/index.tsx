import { useState } from "react";
import Chat from "~/modules/chat/components/Chat";
import { ChatDto } from "~/modules/chat/dtos/ChatDto";
import { ChatMessageDto } from "~/modules/chat/dtos/ChatMessageDto";

const defaultChat: ChatDto = {
  messages: [
    {
      position: "right",
      createdAt: new Date(),
      data: { text: "Text in Right" },
    },
    {
      position: "left",
      createdAt: new Date(),
      data: { text: "Text in Left" },
    },
    {
      position: "right",
      createdAt: new Date(),
      data: {
        file: {
          file: "https://annltjvtrpypkellttgc.supabase.co/storage/v1/object/public/calls/clle8uivx00a8grxl81lnvlm1-Simple_PDF.pdf",
          name: "sample.pdf",
          type: "application/pdf",
        },
      },
    },
    {
      position: "left",
      createdAt: new Date(),
      data: { text: "Ask anything about the PDF" },
    },
    {
      position: "right",
      createdAt: new Date(),
      data: { text: "How to use it?" },
    },
  ],
};

export default function PlaygroundChat() {
  const [messages, setMessages] = useState<ChatMessageDto[]>(defaultChat.messages);

  function onSendMessage(text: string) {
    let newMessage: ChatMessageDto = {
      position: "right",
      data: {
        text,
      },
      createdAt: new Date(),
    };
    if (text === "pdf") {
      newMessage.data = {
        file: {
          file: "https://annltjvtrpypkellttgc.supabase.co/storage/v1/object/public/calls/clle8uivx00a8grxl81lnvlm1-Simple_PDF.pdf",
          name: "sample.pdf",
          type: "application/pdf",
        },
      };
    }
    setMessages([...messages, newMessage]);
  }
  function onDeleteMessage(message: ChatMessageDto, index: number) {
    setMessages([...messages.slice(0, index), ...messages.slice(index + 1)]);
  }
  return (
    <div>
      <Chat messages={messages} onSendMessage={onSendMessage} onDeleteMessage={onDeleteMessage} />
    </div>
  );
}
