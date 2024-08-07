import {
  Prisma,
  Row,
  Tenant,
  RowValue,
  ApiKey,
  RowMedia,
  RowRelationship,
  SampleCustomEntity,
  RowPermission,
  RowValueMultiple,
  RowValueRange,
  IntegrationRow,
} from "@prisma/client";
import { RowFiltersDto } from "~/application/dtos/data/RowFiltersDto";
import { MediaDto } from "~/application/dtos/entities/MediaDto";
import { deleteRowMediaFromStorageProvider, storeRowMediaInStorageProvider } from "~/utils/helpers/.server/MediaService";
import RowFiltersHelper from "~/utils/helpers/RowFiltersHelper";
import TenantHelper from "~/utils/helpers/TenantHelper";
import { db } from "../../db.server";
import { UserSimple } from "../users.db.server";
import { EntityWithDetails, getEntityById } from "./entities.db.server";
import { RowTagWithDetails } from "./rowTags.db.server";
import { getRowPermissionsCondition } from "~/utils/helpers/.server/PermissionsService";
import { RowValueMultipleDto } from "~/application/dtos/entities/RowValueMultipleDto";
import { RowValueRangeDto } from "~/application/dtos/entities/RowValueRangeDto";
import RowModelHelper from "~/utils/helpers/models/RowModelHelper";

export type RowValueWithDetails = RowValue & {
  media: RowMedia[];
  multiple: RowValueMultiple[];
  range: RowValueRange | null;
};
export type RowWithValues = Row & {
  createdByUser: UserSimple | null;
  createdByApiKey: ApiKey | null;
  values: RowValueWithDetails[];
};
export type RowWithCreatedBy = Row & {
  createdByUser: UserSimple | null;
  createdByApiKey: ApiKey | null;
};
export type RowWithDetails = Row & {
  createdByUser: UserSimple | null;
  createdByApiKey: ApiKey | null;
  tenant: Tenant | null;
  values: RowValueWithDetails[];
  tags: RowTagWithDetails[];
  parentRows:
    | (RowRelationship & { parent: RowWithValues })[]
    | (RowRelationship & {
        parent: RowWithValues & {
          parentRows: (RowRelationship & {
            parent: { values: RowValueWithDetails[] };
          })[];
          childRows: (RowRelationship & {
            child: { values: RowValueWithDetails[] };
          })[];
        };
      })[];
  childRows: (RowRelationship & {
    child: RowWithValues & {
      parentRows: (RowRelationship & {
        parent: { values: RowValueWithDetails[] };
      })[];
      childRows: (RowRelationship & {
        child: { values: RowValueWithDetails[] };
      })[];
    };
  })[];
  permissions: RowPermission[];
  sampleCustomEntity: SampleCustomEntity | null;
  integrationRows: IntegrationRow[];
};

export async function getAllRows(entityId: string): Promise<RowWithDetails[]> {
  return await db.row.findMany({
    where: {
      deletedAt: null,
      entityId,
    },
    include: RowModelHelper.includeRowDetails,
  });
}

export async function getRows({
  entityId,
  entityName,
  tenantId,

  userId,
  take,
  skip,
  orderBy,
  filters,
  ids,
  rowWhere,
  includePublic,
}: {
  entityId?: string;
  entityName?: string;
  tenantId?: string | null;

  userId?: string;
  take?: number;
  skip?: number;
  orderBy?: Prisma.RowOrderByWithRelationInput[];
  filters?: RowFiltersDto;
  ids?: string[];
  rowWhere?: Prisma.RowWhereInput;
  includePublic?: boolean;
}): Promise<RowWithDetails[]> {
  const whereFilters = RowFiltersHelper.getRowFiltersCondition(filters);
  let filterEntity: Prisma.RowWhereInput | undefined = undefined;
  if (entityId) {
    filterEntity = { entityId };
  } else if (entityName) {
    filterEntity = { entity: { name: entityName } };
  }

  const accessFilters = await getAccessFilters({ tenantId });
  const where: Prisma.RowWhereInput = {
    AND: [
      { deletedAt: null },
      { ...rowWhere },
      whereFilters,
      { id: { in: ids } },
      { ...filterEntity },
      { ...accessFilters },
      // ...getSearchCondition(filters?.query),
    ],
  };
  return await db.row.findMany({
    take,
    skip,
    where,
    include: RowModelHelper.includeRowDetails,
    orderBy,
  });
}

export async function getRowsBetween(name: string, tenantId: string | null, startDate: Date, endDate: Date): Promise<RowWithDetails[]> {
  return await db.row.findMany({
    where: {
      AND: [
        { deletedAt: null },
        {
          entity: { name },
          ...TenantHelper.tenantCondition({ tenantId }),
        },
        {
          createdAt: {
            lte: endDate,
            gte: startDate,
          },
        },
      ],
    },
    include: RowModelHelper.includeRowDetails,
    orderBy: { createdAt: "asc" },
  });
}

export async function getRowsInIds(ids: string[], tenantId?: string | null): Promise<RowWithDetails[]> {
  return await db.row.findMany({
    where: {
      deletedAt: null,
      id: {
        in: ids,
      },
      tenantId,
    },
    include: RowModelHelper.includeRowDetails,
  });
}

export async function countRows({
  entityId,
  entityName,
  tenantId,

  userId,
  filters,
  rowWhere,
  includePublic,
}: {
  entityId?: string;
  entityName?: string;
  tenantId?: string | null;

  userId?: string | undefined;
  filters?: RowFiltersDto;
  rowWhere?: Prisma.RowWhereInput;
  includePublic?: boolean;
}): Promise<number> {
  const whereFilters = RowFiltersHelper.getRowFiltersCondition(filters);
  let filterEntity: { entityId: string } | { entity: { name: string } } | undefined = undefined;
  if (entityId) {
    filterEntity = { entityId };
  } else if (entityName) {
    filterEntity = { entity: { name: entityName } };
  }

  const accessFilters = await getAccessFilters({ tenantId });
  const where: Prisma.RowWhereInput = {
    AND: [
      { deletedAt: null },
      { ...rowWhere },
      whereFilters,
      // { id: { in: ids } },
      { ...filterEntity },
      { ...accessFilters },
      // ...getSearchCondition(filters?.query),
    ],
  };
  return await db.row.count({
    where,
  });
}

export async function getRow({ entityId, id, tenantId }: { entityId: string; id: string; tenantId?: string | null }): Promise<RowWithDetails | null> {
  const accessFilters = await getAccessFilters({ tenantId });
  return await db.row.findFirst({
    where: {
      deletedAt: null,
      id,
      entityId,
      ...accessFilters,
    },
    include: {
      ...RowModelHelper.includeRowDetailsNested,
    },
  });
}

export async function getRowById(id: string): Promise<RowWithDetails | null> {
  return await db.row.findUnique({
    where: {
      deletedAt: null,
      id,
    },
    include: {
      ...RowModelHelper.includeRowDetailsNested,
    },
  });
}

export async function getMaxRowFolio({ tenantId, entityId }: { tenantId: string | null; entityId: string }) {
  let where: any = { tenantId, entityId };
  return await db.row.aggregate({
    where,
    _max: {
      folio: true,
    },
  });
}

export async function getNextRowFolio({ tenantId, entityId }: { tenantId: string | null; entityId: string }) {
  const maxFolio = await getMaxRowFolio({ tenantId, entityId });
  let next = 1;
  if (maxFolio && maxFolio._max.folio !== null) {
    next = maxFolio._max.folio + 1;
  }
  return next;
}

export async function getMaxRowOrder({ tenantId, entityId }: { tenantId: string | null; entityId: string }) {
  let where: any = { tenantId, entityId };
  return await db.row.aggregate({
    where,
    _max: {
      order: true,
    },
  });
}

export async function getNextRowOrder({ tenantId, entityId }: { tenantId: string | null; entityId: string }) {
  const maxOrder = await getMaxRowOrder({ tenantId, entityId });
  let next = 1;
  if (maxOrder && maxOrder._max.order !== null) {
    next = maxOrder._max.order + 1;
  }
  return next;
}

export async function createRow({
  entity,
  data,
  nextFolio,
  nextOrder,
}: {
  entity: EntityWithDetails;
  data: {
    tenantId: string | null;

    createdByUserId?: string | null;
    createdByApiKeyId?: string | null;
    properties: any;
    dynamicProperties?: {
      propertyId: string;
      id?: string | null;
      textValue?: string | null;
      numberValue?: number | string | null;
      dateValue?: Date | string | null;
      booleanValue?: boolean | null;
      media?: MediaDto[];
      multiple?: RowValueMultipleDto[];
      range?: RowValueRangeDto;
    }[];
    parentRows?: { relationshipId: string; parentId: string }[];
    childRows?: { relationshipId: string; childId: string }[];
    rowCreateInput?: Partial<Prisma.RowCreateInput>;
  };
  nextFolio?: number | undefined;
  nextOrder?: number | undefined;
}) {
  let folio = nextFolio ?? 1;
  if (!nextFolio) {
    const maxFolio = await getMaxRowFolio({ tenantId: data.tenantId, entityId: entity.id });
    if (maxFolio && maxFolio._max.folio !== null) {
      folio = maxFolio._max.folio + 1;
    }
  }

  let order = nextOrder ?? 1;
  if (!nextOrder) {
    const maxOrder = await getMaxRowOrder({ tenantId: data.tenantId, entityId: entity.id });
    if (maxOrder && maxOrder._max.order !== null) {
      order = maxOrder._max.order + 1;
    }
  }

  const createInput: Prisma.XOR<Prisma.RowCreateInput, Prisma.RowUncheckedCreateInput> = {
    folio,
    order,
    entityId: entity.id,
    tenantId: data.tenantId,
    createdByUserId: data.createdByUserId ?? null,
    createdByApiKeyId: data.createdByApiKeyId ?? null,
    ...data.properties,
    values: {
      create: data.dynamicProperties
        // .filter((f) => !f.id)
        ?.map((value) => {
          return {
            propertyId: value.propertyId,
            textValue: value.textValue,
            numberValue: value.numberValue,
            dateValue: value.dateValue,
            booleanValue: value.booleanValue,
            media: {
              create: value.media?.map((m) => {
                return {
                  name: m.name,
                  title: m.title,
                  type: m.type,
                  file: m.file,
                  publicUrl: m.publicUrl,
                };
              }),
            },
            multiple: {
              create: value.multiple?.map((m) => {
                return {
                  order: m.order,
                  value: m.value,
                };
              }),
            },
            range: {
              create: {
                numberMin: value.range?.numberMin,
                numberMax: value.range?.numberMax,
                dateMin: value.range?.dateMin,
                dateMax: value.range?.dateMax,
              },
            },
          };
        }),
    },
    parentRows: {
      create: data.parentRows?.map(({ relationshipId, parentId }) => {
        return {
          relationshipId,
          parentId,
        };
      }),
    },
    childRows: {
      create: data.childRows?.map(({ relationshipId, childId }) => {
        return {
          relationshipId,
          childId,
        };
      }),
    },
    ...data.rowCreateInput,
  };
  const row = await db.row.create({
    data: createInput,
  });

  return row;
}

export async function updateRow(
  id: string,
  data: {
    properties: any;
    dynamicProperties: {
      propertyId: string;
      id?: string | null;
      textValue?: string | null;
      numberValue?: number | string | null;
      dateValue?: Date | string | null;
      booleanValue?: boolean | null;
      media?: MediaDto[];
      multiple?: RowValueMultipleDto[];
      range?: RowValueRangeDto | undefined;
    }[];
    parentRows?: { relationshipId: string; parentId: string }[];
    childRows?: { relationshipId: string; childId: string }[];
    rowUpdateInput?: Prisma.RowUpdateInput;
  }
) {
  let row = await getRowById(id);
  // await deleteRowMediaFromStorageProvider(row);

  if (data.parentRows) {
    const { count } = await db.rowRelationship.deleteMany({
      where: { childId: id },
    });
    // eslint-disable-next-line no-console
    console.log("Deleted parent rows: " + count);
  }
  if (data.childRows) {
    const { count } = await db.rowRelationship.deleteMany({
      where: { parentId: id },
    });
    // eslint-disable-next-line no-console
    console.log("Deleted child rows: " + count);
  }

  await db.rowMedia.deleteMany({
    where: {
      rowValue: {
        rowId: id,
        propertyId: { in: data.dynamicProperties.map((p) => p.propertyId) },
      },
    },
  });
  await db.rowValueMultiple.deleteMany({
    where: {
      rowValue: {
        rowId: id,
        propertyId: { in: data.dynamicProperties.map((p) => p.propertyId) },
      },
    },
  });
  await db.rowValueRange.deleteMany({
    where: {
      rowValue: {
        rowId: id,
        propertyId: { in: data.dynamicProperties.map((p) => p.propertyId) },
      },
    },
  });
  // eslint-disable-next-line no-console
  // console.log("Deleted media values: " + deletedMedia.count);

  const update: Prisma.RowUpdateInput = {
    ...data.properties,
    values: {
      create: data.dynamicProperties
        .filter((f) => !f.id)
        .map((value) => {
          return {
            propertyId: value.propertyId,
            textValue: value.textValue,
            numberValue: value.numberValue,
            dateValue: value.dateValue,
            booleanValue: value.booleanValue,
            media: {
              create: value.media?.map((m) => {
                return {
                  name: m.name,
                  title: m.title,
                  type: m.type,
                  file: m.file,
                  publicUrl: m.publicUrl,
                };
              }),
            },
            multiple: {
              create: value.multiple?.map((m) => {
                return {
                  order: m.order,
                  value: m.value,
                };
              }),
            },
            range: {
              create: {
                numberMin: value.range?.numberMin,
                numberMax: value.range?.numberMax,
                dateMin: value.range?.dateMin,
                dateMax: value.range?.dateMax,
              },
            },
          };
        }),
      update: data.dynamicProperties
        .filter((f) => f.id)
        .map((value) => {
          return {
            where: { id: value.id },
            data: {
              textValue: value.textValue,
              numberValue: value.numberValue,
              dateValue: value.dateValue,
              booleanValue: value.booleanValue,
              media: {
                create: value.media?.map((m) => {
                  return {
                    name: m.name,
                    title: m.title,
                    type: m.type,
                    file: m.file,
                    publicUrl: m.publicUrl,
                  };
                }),
              },
              multiple: {
                create: value.multiple?.map((m) => {
                  return {
                    order: m.order,
                    value: m.value,
                  };
                }),
              },
              range: {
                create: {
                  numberMin: value.range?.numberMin,
                  numberMax: value.range?.numberMax,
                  dateMin: value.range?.dateMin,
                  dateMax: value.range?.dateMax,
                },
              },
            },
          };
        }),
    },
    parentRows: {
      create: data.parentRows?.map(({ relationshipId, parentId }) => {
        return {
          relationshipId,
          parentId,
        };
      }),
    },
    childRows: {
      create: data.childRows?.map(({ relationshipId, childId }) => {
        return {
          relationshipId,
          childId,
        };
      }),
    },
    ...data.rowUpdateInput,
  };
  await db.row.update({
    where: {
      id,
    },
    data: update,
  });

  row = await getRowById(id);
  if (row) {
    const entity = await getEntityById({ tenantId: row.tenantId, id: row.entityId });
    if (entity && row) {
      await storeRowMediaInStorageProvider(entity, row);
    }
  }

  return row!;
}

export async function deleteRow(id: string) {
  const row = await getRowById(id);
  await deleteRowMediaFromStorageProvider(row);
  return await db.row.delete({
    where: { id },
    include: {
      logs: true,
      values: true,
    },
  });
}

export async function deleteRows(entityId: string) {
  return await db.row.deleteMany({
    where: { entityId },
  });
}

export async function deleteRowsInIds(ids: string[]) {
  return await db.row.deleteMany({
    where: { id: { in: ids } },
  });
}

export async function updateRowMedia(
  id: string,
  data: {
    file?: string;
    publicUrl?: string | null;
    storageBucket?: string | null;
    storageProvider?: string | null;
  }
) {
  await db.rowMedia.update({
    where: { id },
    data,
  });
}

async function getAccessFilters({ tenantId, userId }: { tenantId?: string | null; userId?: string }) {
  let tenantFilters: Prisma.RowWhereInput | undefined = undefined;
  let userPermissionFilters: Prisma.RowWhereInput | undefined = undefined;
  if (tenantId !== undefined) {
    tenantFilters = TenantHelper.tenantCondition({ tenantId });
  }
  if (userId) {
    userPermissionFilters = await getRowPermissionsCondition({ tenantId, userId });
  }
  const filters: Prisma.RowWhereInput = {
    AND: [{ ...tenantFilters }, { ...userPermissionFilters }],
  };
  return filters;
}
