import { Entity, Property, RowMedia, RowValueMultiple } from "@prisma/client";
import { RowValueWithDetails } from "../db/entities/rows.db.server";
import RowHelper from "./RowHelper";
import { RowValueMultipleDto } from "~/application/dtos/entities/RowValueMultipleDto";
import { RowValueRangeDto } from "~/application/dtos/entities/RowValueRangeDto";
import { PropertyWithDetails } from "../db/entities/entities.db.server";

function getText({
  entity,
  row,
  name,
}: {
  entity: Entity & { properties: Property[] };
  row: { values: RowValueWithDetails[] };
  name: string;
}): string | undefined {
  const value = RowHelper.getPropertyValue({ entity, item: row, propertyName: name });
  return value?.toString();
}
function getBoolean({ entity, row, name }: { entity: Entity & { properties: Property[] }; row: { values: RowValueWithDetails[] }; name: string }): boolean {
  return Boolean(RowHelper.getPropertyValue({ entity, item: row, propertyName: name }));
}
function getNumber({
  entity,
  row,
  name,
}: {
  entity: Entity & { properties: Property[] };
  row: { values: RowValueWithDetails[] };
  name: string;
}): number | undefined {
  const value = RowHelper.getPropertyValue({ entity, item: row, propertyName: name });
  return value !== undefined && value !== null ? Number(value) : undefined;
}
function getDate({
  entity,
  row,
  name,
}: {
  entity: Entity & { properties: Property[] };
  row: { values: RowValueWithDetails[] };
  name: string;
}): Date | undefined {
  const value = RowHelper.getPropertyValue({ entity, item: row, propertyName: name });
  if (!value) {
    return undefined;
  }
  return value as Date;
}
function getMedia({ entity, row, name }: { entity: Entity & { properties: Property[] }; row: { values: RowValueWithDetails[] }; name: string }): RowMedia[] {
  const value = (RowHelper.getPropertyValue({ entity, item: row, propertyName: name }) ?? []) as RowMedia[];
  return value;
}
function getFirstMedia({
  entity,
  row,
  name,
}: {
  entity: Entity & { properties: Property[] };
  row: { values: RowValueWithDetails[] };
  name: string;
}): RowMedia | undefined {
  const media = getMedia({ entity, row, name });
  const value = media?.length > 0 ? media[0] : undefined;
  return value;
}
function getFirstMediaFile({
  entity,
  row,
  name,
}: {
  entity: Entity & { properties: Property[] };
  row: { values: RowValueWithDetails[] };
  name: string;
}): string | undefined {
  const media = getFirstMedia({ entity, row, name });
  if (!media) {
    return undefined;
  }
  const value = media?.publicUrl ?? media?.file;
  return value;
}
function getSelected({
  entity,
  row,
  name,
}: {
  entity: Entity & { properties: PropertyWithDetails[] };
  row: { values: RowValueWithDetails[] };
  name: string;
}): { value: string; name: string | null; color: number } | undefined {
  const value = RowHelper.getPropertyValue({ entity, item: row, propertyName: name });
  if (!value) {
    return undefined;
  }
  const option = entity.properties.find((i) => i.name === name)?.options.find((i) => i.value === value);
  if (option) {
    return { name: option.name, value: option.value, color: option.color };
  } else {
    return { name: null, value: value.toString(), color: 0 };
  }
}
function getMultiple({
  entity,
  row,
  name,
}: {
  entity: Entity & { properties: Property[] };
  row: { values: RowValueWithDetails[] };
  name: string;
}): RowValueMultipleDto[] {
  const value = RowHelper.getPropertyValue({ entity, item: row, propertyName: name });
  if (!value) {
    return [];
  }
  let multiple = value as RowValueMultiple[];
  return multiple ?? [];
}
function getNumberRange({
  entity,
  row,
  name,
}: {
  entity: Entity & { properties: Property[] };
  row: { values: RowValueWithDetails[] };
  name: string;
}): RowValueRangeDto {
  const value = RowHelper.getPropertyValue({ entity, item: row, propertyName: name });
  let range = value as RowValueRangeDto;
  if (!range) {
    range = {
      numberMin: null,
      numberMax: null,
      dateMin: null,
      dateMax: null,
    };
  }
  return range;
}
function getDateRange({
  entity,
  row,
  name,
}: {
  entity: Entity & { properties: Property[] };
  row: { values: RowValueWithDetails[] };
  name: string;
}): RowValueRangeDto {
  const value = RowHelper.getPropertyValue({ entity, item: row, propertyName: name });
  let range = value as RowValueRangeDto;
  if (!range) {
    range = {
      numberMin: null,
      numberMax: null,
      dateMin: null,
      dateMax: null,
    };
  }
  return range;
}

export default {
  getText,
  getBoolean,
  getNumber,
  getDate,
  getMedia,
  getFirstMedia,
  getFirstMediaFile,
  getSelected,
  getMultiple,
  getNumberRange,
  getDateRange,
};
