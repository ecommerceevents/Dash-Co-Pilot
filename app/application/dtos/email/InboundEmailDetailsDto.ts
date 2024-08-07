import { InboundEmailDto } from "./InboundEmailDto";

export type InboundEmailDetailsDto = InboundEmailDto & {
  TextBody: string;
  HtmlBody: string;
};
