import { RowMedia, Entity, Prisma, RowValue, RowValueMultiple, RowValueRange } from "@prisma/client";
import { RowsApi } from "../../api/.server/RowsApi";
import { db } from "../../db.server";
import { PropertyWithDetails } from "../../db/entities/entities.db.server";
import { RowValueWithDetails } from "../../db/entities/rows.db.server";
import { RowValueDto } from "~/application/dtos/entities/RowValueDto";
import { RowValueMultipleDto } from "~/application/dtos/entities/RowValueMultipleDto";
import { RowValueRangeDto } from "~/application/dtos/entities/RowValueRangeDto";

export type RowValueUpdateDto = {
  name: string;
  textValue?: string | undefined;
  numberValue?: number | undefined;
  dateValue?: Date | undefined;
  booleanValue?: boolean | undefined;
  media?: RowMedia[];
  multiple?: RowValueMultipleDto[];
  range?: RowValueRangeDto | undefined;
};
async function update({
  entity,
  row,
  values,
  rowUpdateInput,
  session,
  checkPermissions = true,
  options,
}: {
  entity: Entity & { properties: PropertyWithDetails[] };
  row: { id: string; entityId: string; tenantId: string | null; values: RowValueWithDetails[] };
  values?: RowValueUpdateDto[];
  rowUpdateInput?: Prisma.RowUpdateInput;
  session: { tenantId: string | null; userId?: string } | undefined;
  checkPermissions?: boolean;
  options?: {
    createLog?: boolean;
    createEvent?: boolean;
  };
}) {
  const dynamicProperties: RowValueDto[] = [];
  await Promise.all(
    (values ?? []).map(async (value) => {
      const property = entity.properties.find((i) => i.name === value.name);
      if (property) {
        let existingProperty: RowValue | null = row.values.find((f) => f.propertyId === property?.id) ?? null;
        if (!existingProperty) {
          existingProperty = await db.rowValue.findFirstOrThrow({ where: { propertyId: property.id, rowId: row.id } }).catch(() => {
            return null;
          });
        }
        if (!existingProperty) {
          existingProperty = await db.rowValue.create({
            data: {
              propertyId: property.id,
              rowId: row.id,
              textValue: value.textValue,
              numberValue: value.numberValue,
              dateValue: value.dateValue,
            },
          });
        }
        dynamicProperties.push({
          id: existingProperty.id,
          property,
          propertyId: property.id,
          textValue: value.textValue,
          numberValue: value.numberValue,
          dateValue: value.dateValue,
          booleanValue: value.booleanValue,
          media: value.media,
          multiple: value.multiple as RowValueMultiple[],
          range: value.range as RowValueRange,
        });
        if (value.textValue !== undefined) {
          existingProperty.textValue = value.textValue;
        }
        if (value.numberValue !== undefined) {
          existingProperty.numberValue = value.numberValue ? new Prisma.Decimal(value.numberValue) : null;
        }
        if (value.dateValue !== undefined) {
          existingProperty.dateValue = value.dateValue;
        }
        if (value.booleanValue !== undefined) {
          existingProperty.booleanValue = value.booleanValue;
        }
      }
    })
  );
  return await RowsApi.update(row.id, {
    entity,
    tenantId: row.tenantId,
    rowValues: {
      dynamicProperties,
    },
    rowUpdateInput,
    userId: session?.userId,
    checkPermissions,
    options,
  });
}

export default {
  update,
};
