import { ApiKeyEntity, Entity } from "@prisma/client";
import { ApiKeyEntityPermissionDto } from "~/application/dtos/apiKeys/ApiKeyEntityPermissionDto";
import { getEntitiesInIds } from "~/utils/db/entities/entities.db.server";

export async function getApiKeyEntityPermissions(
  entities:
    | {
        entityId: string;
        create: boolean;
        read: boolean;
        update: boolean;
        delete: boolean;
      }[]
    | (ApiKeyEntity & { entity: Entity })[]
): Promise<ApiKeyEntityPermissionDto[]> {
  const apiKeyEntities = await getEntitiesInIds(entities.map((f) => f.entityId));
  const entityPermissions: ApiKeyEntityPermissionDto[] = [];
  entities.forEach((apiKeyEntity) => {
    const entity = apiKeyEntities.find((f) => f.id === apiKeyEntity.entityId);
    entityPermissions.push({
      id: apiKeyEntity.entityId,
      name: entity?.name ?? "",
      create: apiKeyEntity.create,
      read: apiKeyEntity.read,
      update: apiKeyEntity.update,
      delete: apiKeyEntity.delete,
    });
  });
  return entityPermissions;
}
