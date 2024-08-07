import { ApiKeyLog } from "@prisma/client";

export type ApiKeyLogDto = ApiKeyLog & {
  apiKey: { alias: string; tenant: { id: string; name: string } } | null;
  tenant?: { id: string; name: string; slug: string } | null | undefined;
};
