import { Permission } from "@prisma/client";
import { TenantTypeDto } from "./TenantTypeDto";

export type TenantTypeRelationshipDto = {
  id?: string;
  fromTypeId: string | null;
  toTypeId: string | null;
  fromType: TenantTypeDto | null;
  toType: TenantTypeDto | null;
  canCreate: boolean;
  hasRelationship: boolean;
  permissions?: Permission[];
};
