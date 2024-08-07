import { ApiKey } from "@prisma/client";
import { getApiKeyById } from "../db/apiKeys.db.server";
import { getUser, UserWithoutPassword } from "../db/users.db.server";

export async function getRowUserOrApiKey(data: { userId?: string | null; apiKeyId?: string | null }) {
  // Event: RowCreated
  let createdByUser: UserWithoutPassword | null = null;
  let createdByApiKey: ApiKey | null = null;
  let user: any = undefined;
  let apiKey: any = undefined;
  if (data.userId) {
    createdByUser = await getUser(data.userId);
    user = { id: createdByUser?.id, email: createdByUser?.email ?? "" };
  }
  if (data.apiKeyId) {
    createdByApiKey = await getApiKeyById(data.apiKeyId);
    apiKey = { id: createdByApiKey?.id, email: createdByApiKey?.alias ?? "" };
  }
  return {
    user,
    apiKey,
  };
}
