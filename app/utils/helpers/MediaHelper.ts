import { EmailAttachment } from "@prisma/client";
import { MediaDto } from "~/application/dtos/entities/MediaDto";

export function getAttachmentToMedia(attachment: EmailAttachment): MediaDto {
  return {
    title: attachment.name,
    name: attachment.name,
    file: attachment.publicUrl ?? attachment.content,
    type: attachment.type,
  };
}
