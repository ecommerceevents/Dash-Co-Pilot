import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { EntityWithDetails } from "../db/entities/entities.db.server";
import { RowWithDetails } from "../db/entities/rows.db.server";
import { RowValueDto } from "~/application/dtos/entities/RowValueDto";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import RowHelper from "../helpers/RowHelper";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { PropertyType } from "~/application/enums/entities/PropertyType";

export namespace RowHooks {
  type OnBeforeGetAllParams = {
    entity: EntityWithDetails;
    tenantId?: string | null;
    userId?: string;
    urlSearchParams?: URLSearchParams;
  };
  export async function onBeforeGetAll({ entity, tenantId, userId, urlSearchParams }: OnBeforeGetAllParams) {
    // eslint-disable-next-line no-console
    // console.log("onBeforeGetAll", { entity: { name: entity.name }, session: { tenantId, userId }, urlSearchParams: urlSearchParams?.toString() });
  }
  type OnAfterGetAllParams = OnBeforeGetAllParams & {
    items: RowWithDetails[];
    pagination: PaginationDto;
  };
  export async function onAfterGetAll({ entity, tenantId, userId, urlSearchParams, items }: OnAfterGetAllParams) {
    // eslint-disable-next-line no-console
    // console.log("onAfterGetAll", {
    //   entity: { name: entity.name },
    //   session: { tenantId, userId },
    //   urlSearchParams: urlSearchParams?.toString(),
    //   items: items.map((f) => RowHelper.getTextDescription({ entity, item: f, defaultsToFolio: true })),
    // });
  }
  type OnBeforeGetParams = {
    id: string;
    entity: EntityWithDetails;
    tenantId?: string | null;
    userId?: string;
  };
  export async function onBeforeGet({ id, entity, tenantId, userId }: OnBeforeGetParams) {
    // eslint-disable-next-line no-console
    // console.log("onBeforeGet", { id, entity: { name: entity.name }, session: { tenantId, userId } });
  }
  type OnAfterGetParams = OnBeforeGetParams & {
    item: RowWithDetails;
  };
  export async function onAfterGet({ id, entity, tenantId, userId, item }: OnAfterGetParams) {
    // eslint-disable-next-line no-console
    // console.log("onAfterGet", {
    //   id,
    //   entity: { name: entity.name },
    //   session: { tenantId, userId },
    //   item: RowHelper.getTextDescription({ entity, item, defaultsToFolio: true }),
    // });
  }
  type OnBeforeCreateParams = {
    entity: EntityWithDetails;
    tenantId: string | null;
    userId?: string;
    rowValues:
      | {
          dynamicProperties: RowValueDto[];
          properties?: any;
          parentRows?: { relationshipId: string; parentId: string }[];
          childRows?: { relationshipId: string; childId: string }[];
        }
      | undefined;
  };
  export async function onBeforeCreate({ entity, tenantId, userId, rowValues }: OnBeforeCreateParams) {
    // eslint-disable-next-line no-console
    // console.log("onBeforeCreate", {
    //   entity: { name: entity.name },
    //   session: { tenantId, userId },
    //   rowValues: {
    //     dynamicProperties: rowValues?.dynamicProperties.length,
    //   },
    // });
  }
  type OnAfterCreateParams = OnBeforeCreateParams & {
    item: RowWithDetails;
  };
  export async function onAfterCreate({ entity, tenantId, userId, rowValues, item }: OnAfterCreateParams) {
    // eslint-disable-next-line no-console
    // console.log("onAfterCreate", {
    //   entity: { name: entity.name },
    //   session: { tenantId, userId },
    //   rowValues: {
    //     dynamicProperties: rowValues?.dynamicProperties.length,
    //   },
    //   item: RowHelper.getTextDescription({ entity, item, defaultsToFolio: true }),
    // });
  }
  type OnBeforeUpdateParams = {
    id: string;
    item: RowWithDetails;
    entity: EntityWithDetails;
    tenantId: string | null;
    userId?: string;
    rowValues:
      | {
          dynamicProperties: RowValueDto[];
          properties?: any;
          parentRows?: { relationshipId: string; parentId: string }[];
          childRows?: { relationshipId: string; childId: string }[];
        }
      | undefined;
  };
  export async function onBeforeUpdate({ id, item, entity, tenantId, userId, rowValues }: OnBeforeUpdateParams) {
    // eslint-disable-next-line no-console
    // console.log("onBeforeUpdate", {
    //   id,
    //   entity: { name: entity.name },
    //   session: { tenantId, userId },
    //   rowValues,
    //   item: RowHelper.getTextDescription({ entity, item, defaultsToFolio: true }),
    // });
    // entity.properties.forEach((property) => {
    //   const value = rowValues?.dynamicProperties.find((x) => x.propertyId === property.id);
    //   if (!value) {
    //     return;
    //   }
    //   if (property.type === PropertyType.TEXT) {
    //     value.textValue = "EXAMPLE: TEXT OVERRIDE";
    //   }
    // });
  }
  type OnAfterUpdateParams = OnBeforeUpdateParams & {
    item: RowWithDetails;
  };
  export async function onAfterUpdate({ id, entity, tenantId, userId, rowValues, item }: OnAfterUpdateParams) {
    // eslint-disable-next-line no-console
    // console.log("onAfterUpdate", {
    //   id,
    //   entity: { name: entity.name },
    //   session: { tenantId, userId },
    //   rowValues: {
    //     dynamicProperties: rowValues?.dynamicProperties.length,
    //   },
    //   item: RowHelper.getTextDescription({ entity, item, defaultsToFolio: true }),
    // });
  }
  type OnBeforeDeleteParams = {
    id: string;
    item: RowWithDetails;
    entity: EntityWithDetails;
    tenantId: string | null;
    userId?: string;
  };
  export async function onBeforeDelete({ id, item, entity, tenantId, userId }: OnBeforeDeleteParams) {
    // eslint-disable-next-line no-console
    // console.log("onBeforeDelete", {
    //   id,
    //   entity: { name: entity.name },
    //   session: { tenantId, userId },
    //   item: RowHelper.getTextDescription({ entity, item, defaultsToFolio: true }),
    // });
  }
  type OnAfterDeleteParams = OnBeforeDeleteParams & {
    item: RowWithDetails;
  };
  export async function onAfterDelete({ id, entity, tenantId, userId, item }: OnAfterDeleteParams) {
    // eslint-disable-next-line no-console
    // console.log("onAfterDelete", {
    //   id,
    //   entity: { name: entity.name },
    //   session: { tenantId, userId },
    //   item: RowHelper.getTextDescription({ entity, item, defaultsToFolio: true }),
    // });
  }
}
