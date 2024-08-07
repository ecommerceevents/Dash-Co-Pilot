import { EntitySimple } from "~/utils/db/entities/entities.db.server";
import { TenantTypeDto } from "./TenantTypeDto";

export type TenantTypeEntityDto = {
  id?: string;
  tenantTypeId: string | null;
  tenantType: TenantTypeDto | null;
  entityId: string;
  entity: EntitySimple;
  enabled: boolean;
};
