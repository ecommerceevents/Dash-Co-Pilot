import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import { TenantWithDetails } from "~/utils/db/tenants.db.server";
import { UserWithDetails } from "~/utils/db/users.db.server";

export type FormulaVariableValueDto = {
  plain?: {
    variable: string;
    textValue?: string | undefined;
    numberValue?: number | undefined;
    dateValue?: Date | undefined;
    booleanValue?: boolean | undefined;
  };
  row?: {
    entity: EntityWithDetails;
    item: RowWithDetails;
  };
  tenant?: TenantWithDetails;
  user?: UserWithDetails;
};
