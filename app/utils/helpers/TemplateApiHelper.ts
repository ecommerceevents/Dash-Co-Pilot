import { TFunction } from "i18next";
import type { EntityWithDetails } from "../db/entities/entities.db.server";
import type { UserSimple } from "../db/users.db.server";
import type { TenantWithDetails } from "../db/tenants.db.server";
import TenantHelper from "./TenantHelper";

export type RowAsJson = {
  id: string;
  entityId: string;
  name: string;
  data: any;
  tenant: TenantWithDetails | null;
};

export interface TemplateValueResultDto {
  variable: { [key: string]: string | number };
  row?: any;
  session: {
    user: { firstName: string; lastName: string; email: string; createdAt: Date } | null;
    tenant: { [key: string]: any } | null;
  };
  promptFlow?: {
    results: {
      [key: number]: string;
    };
  };
}
function getTemplateValue({
  allEntities,
  t,
  session,
  variables,
  row,
}: {
  allEntities: EntityWithDetails[];
  t: TFunction;
  session: {
    user: UserSimple | null;
    tenant: TenantWithDetails | null;
  };
  variables: {
    [key: string]: string | number;
  };
  row: RowAsJson | undefined;
}): TemplateValueResultDto {
  const tenantSettingsEntity = allEntities.find((f) => f.name === "tenantSettings") ?? null;
  let object: TemplateValueResultDto = {
    variable: {},
    row: row ? {} : undefined,
    session: {
      user: !session.user
        ? null
        : {
            firstName: session.user!.firstName,
            lastName: session.user!.lastName,
            email: session.user!.email,
            createdAt: session.user!.createdAt,
          },
      tenant: !session.tenant ? null : TenantHelper.apiFormat({ tenant: session.tenant, subscriptions: null, tenantSettingsEntity, t }),
    },
    promptFlow: {
      results: [],
    },
  };

  if (Object.keys(variables).length > 0) {
    object.variable = variables;
  }

  if (row) {
    object.row = row.data;
  }

  return object;
}

export default {
  getTemplateValue,
};
