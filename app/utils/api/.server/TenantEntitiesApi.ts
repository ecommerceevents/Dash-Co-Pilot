import { getAllTenantTypes } from "../../db/tenants/tenantTypes.db.server";
import { EntityWithDetails, getAllEntities } from "../../db/entities/entities.db.server";
import { db } from "../../db.server";
import { TenantTypeEntityDto } from "~/application/dtos/tenants/TenantTypeEntityDto";
import { DefaultEntityTypes } from "~/application/dtos/shared/DefaultEntityTypes";
import { TenantTypeDto } from "~/application/dtos/tenants/TenantTypeDto";

export namespace TenantEntitiesApi {
  export async function getEntities({ tenantId, inTypes, enabledOnly }: { tenantId: string | null; inTypes?: TenantTypeDto[]; enabledOnly?: boolean }) {
    const allTypes = await getAllTenantTypes();
    const allEntities = await getAllEntities({ tenantId, active: true, types: [DefaultEntityTypes.All, DefaultEntityTypes.AppOnly] });
    const relationships = await db.tenantTypeEntity.findMany({});

    const entities: EntityWithDetails[] = [];
    const tenantTypeEntities: TenantTypeEntityDto[] = [];
    [null, ...(inTypes ?? allTypes)].forEach((type) => {
      allEntities.forEach((entity) => {
        const existing = relationships.find((f) => f.tenantTypeId === (type?.id || null) && f.entityId === entity.id);
        tenantTypeEntities.push({
          id: existing?.id,
          tenantTypeId: type?.id || null,
          tenantType: type || null,
          entityId: entity.id,
          entity: entity,
          enabled: existing?.enabled || false,
        });
      });
    });

    allEntities.forEach((entity) => {
      if (enabledOnly === undefined) {
        entities.push(entity);
      } else if (enabledOnly && tenantTypeEntities.find((f) => f.entityId === entity.id && f.enabled)) {
        entities.push(entity);
      }
    });

    return { allEntities: entities, tenantTypeEntities };
  }
}
