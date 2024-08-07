import { TenantTypeDto } from "./TenantTypeDto";
import { TenantTypeRelationshipDto } from "./TenantTypeRelationshipDto";

export type FromTenantTypeRelationshipDto = {
  fromTypeId: string | null;
  fromType: TenantTypeDto | null;
  to: {
    toTypeId: string | null;
    toType: TenantTypeDto | null;
    relationship: TenantTypeRelationshipDto;
  }[];
};
