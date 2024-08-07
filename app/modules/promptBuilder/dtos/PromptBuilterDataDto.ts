import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import { PromptBuilderVariableDto } from "./PromptBuilderVariableDto";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import { TenantWithDetails } from "~/utils/db/tenants.db.server";
import { UserWithDetails } from "~/utils/db/users.db.server";

export type PromptBuilderDataDto = {
  variable: PromptBuilderVariableDto;
  text?: string;
  row?: {
    entity: EntityWithDetails;
    item: RowWithDetails;
  };
  tenant?: TenantWithDetails;
  user?: UserWithDetails;
};
