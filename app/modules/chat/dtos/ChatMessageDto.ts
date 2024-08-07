export type ChatMessageDto = {
  position: "left" | "right";
  data:
    | { text: string }
    | { error: string }
    | { loading: boolean }
    | {
        file: { file: string; name: string; type: string };
      };
  createdAt: Date;
};
