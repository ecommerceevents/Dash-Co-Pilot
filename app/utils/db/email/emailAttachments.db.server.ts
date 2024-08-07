import { db } from "~/utils/db.server";

export async function updateEmailAttachmentFileProvider(
  id: string,
  data: {
    content?: string;
    publicUrl?: string | null;
    storageBucket?: string | null;
    storageProvider?: string | null;
  }
) {
  await db.emailAttachment.update({
    where: {
      id,
    },
    data,
  });
}
