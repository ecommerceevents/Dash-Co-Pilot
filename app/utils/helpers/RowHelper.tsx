import { Entity, Property, RowMedia, RowValue, RowValueMultiple, RowValueRange } from "@prisma/client";
import { Decimal } from "decimal.js";
import { RowValueDto } from "~/application/dtos/entities/RowValueDto";
import { MediaDto } from "~/application/dtos/entities/MediaDto";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import { EntityWithDetails, EntityWithProperties, PropertyWithDetails } from "../db/entities/entities.db.server";
import NumberUtils, { NumberFormatType } from "../shared/NumberUtils";
import { validatePropertyValue, validatePropertyValue_Media, validatePropertyValue_Multiple } from "./PropertyHelper";
import { TFunction } from "i18next";
import { RowValueWithDetails, RowWithValues } from "../db/entities/rows.db.server";
import { PropertyAttributeName } from "~/application/enums/entities/PropertyAttributeName";
import PropertyOptionValueBadge from "~/components/entities/properties/PropertyOptionValueBadge";
import RowMediaCell from "~/components/entities/rows/cells/RowMediaCell";
import RowBooleanCell, { getBooleanAsStringValue } from "~/components/entities/rows/cells/RowBooleanCell";
import { BooleanFormatType } from "../shared/BooleanUtils";
import RowNumberCell, { getNumberAsStringValue } from "~/components/entities/rows/cells/RowNumberCell";
import RowDateCell, { getDateAsString } from "~/components/entities/rows/cells/RowDateCell";
import { DateFormatType } from "../shared/DateUtils";
import { RowValueMultipleDto } from "~/application/dtos/entities/RowValueMultipleDto";
import PropertyMultipleValueBadge from "~/components/entities/properties/PropertyMultipleValueBadge";
import { RowValueRangeDto } from "~/application/dtos/entities/RowValueRangeDto";
import PropertyFormulaValueBadge from "~/components/entities/properties/PropertyFormulaValueBadge";
import FormulaHelpers from "~/modules/formulas/utils/FormulaHelpers";
import { SelectOptionsDisplay } from "../shared/SelectOptionsUtils";
import RowRangeNumberCell from "~/components/entities/rows/cells/RowRangeNumberCell";
import RowRangeDateCell from "~/components/entities/rows/cells/RowRangeDateCell";
import PropertyAttributeHelper from "./PropertyAttributeHelper";
// import RelationshipHelper from "./RelationshipHelper";

const getCellValue = ({ entity, item, property }: { entity: EntityWithDetails; item: RowWithValues; property: PropertyWithDetails }) => {
  const value = getPropertyValue({ entity, item, property });
  if (property.type === PropertyType.BOOLEAN) {
    const format = property.attributes.find((f) => f.name === PropertyAttributeName.FormatBoolean)?.value;
    return <RowBooleanCell value={value as boolean} format={format as BooleanFormatType} />;
  } else if (property.type === PropertyType.SELECT) {
    const display = property.attributes.find((f) => f.name === PropertyAttributeName.SelectOptions)?.value as SelectOptionsDisplay;
    return <PropertyOptionValueBadge entity={entity} property={property.name} value={value as string} display={display} />;
  } else if ([PropertyType.MULTI_SELECT, PropertyType.MULTI_TEXT].includes(property.type)) {
    return <PropertyMultipleValueBadge values={value as RowValueMultiple[]} options={property.options} />;
  } else if ([PropertyType.RANGE_NUMBER].includes(property.type)) {
    const range = value as RowValueRangeDto;
    const format = property.attributes.find((f) => f.name === PropertyAttributeName.FormatNumber)?.value as NumberFormatType;
    return <RowRangeNumberCell value={range} format={format} currencySymbol={undefined} />;
  } else if ([PropertyType.RANGE_DATE].includes(property.type)) {
    const range = value as RowValueRangeDto;
    const format = property.attributes.find((f) => f.name === PropertyAttributeName.FormatDate)?.value as DateFormatType;
    return <RowRangeDateCell value={range} format={format} />;
  } else if ([PropertyType.FORMULA].includes(property.type)) {
    return <PropertyFormulaValueBadge property={property} value={value} />;
  } else if (property.type === PropertyType.NUMBER) {
    const format = property.attributes.find((f) => f.name === PropertyAttributeName.FormatNumber)?.value;
    return <RowNumberCell value={value as number} format={format as NumberFormatType} />;
  } else if (property.type === PropertyType.DATE) {
    const format = property.attributes.find((f) => f.name === PropertyAttributeName.FormatDate)?.value;
    return <RowDateCell value={value as Date} format={format as DateFormatType} />;
  } else if (property.type === PropertyType.MEDIA) {
    const media = value as MediaDto[];
    return <RowMediaCell media={media} />;
  } else if (property.type === PropertyType.SELECT && value) {
    const display = property.attributes.find((f) => f.name === PropertyAttributeName.SelectOptions)?.value as SelectOptionsDisplay;
    return <PropertyOptionValueBadge entity={entity} property={property.name} value={value as string} display={display} />;
  }
  let formattedValue = getFormattedValue(value, property.type);
  if (PropertyAttributeHelper.getPropertyAttributeValue_Boolean(property, PropertyAttributeName.Password)) {
    formattedValue = "************************";
  } else if (PropertyAttributeHelper.getPropertyAttributeValue_String(property, PropertyAttributeName.Editor) === "wysiwyg") {
    return <div className="truncate" dangerouslySetInnerHTML={{ __html: formattedValue }} />;
  }
  return formattedValue;
};

const getValueAsString = ({
  entity,
  item,
  property,
  t,
}: {
  entity: EntityWithProperties;
  item: { id: string; values: RowValueWithDetails[] };
  property: PropertyWithDetails;
  t?: TFunction;
}) => {
  const value = getPropertyValue({ entity, item, property });
  if (value === null) {
    return null;
  }
  if (property.type === PropertyType.TEXT) {
    if (property.attributes.find((f) => f.name === PropertyAttributeName.Editor)?.value) {
      return null;
    }
    return value as string;
  } else if (property.type === PropertyType.BOOLEAN) {
    const format = property.attributes.find((f) => f.name === PropertyAttributeName.FormatBoolean)?.value;
    return getBooleanAsStringValue({ value: value as boolean, format: format as BooleanFormatType, t });
  } else if (property.type === PropertyType.SELECT) {
    const option = property.options.find((f) => f.value === value);
    if (option) {
      return option.name ?? option.value;
    }
    return value?.toString();
  } else if ([PropertyType.MULTI_SELECT, PropertyType.MULTI_TEXT].includes(property.type)) {
    return (value as RowValueMultiple[]).map((v) => v.value).join(", ");
  } else if ([PropertyType.RANGE_NUMBER, PropertyType.RANGE_DATE].includes(property.type)) {
    const range = value as RowValueRangeDto;
    if (property.type === PropertyType.RANGE_NUMBER) {
      const numberFormat = property.attributes.find((f) => f.name === PropertyAttributeName.FormatNumber)?.value as NumberFormatType;
      const numberMin = range?.numberMin ? Number(range?.numberMin) : undefined;
      const numberMax = range?.numberMax ? Number(range?.numberMax) : undefined;
      const min = getNumberAsStringValue({ value: numberMin, format: numberFormat });
      const max = getNumberAsStringValue({ value: numberMax, format: numberFormat });
      return `${min} - ${max}`;
    } else {
      const dateFormat = property.attributes.find((f) => f.name === PropertyAttributeName.FormatDate)?.value as DateFormatType;
      const min = getDateAsString({ value: range?.dateMin, format: dateFormat });
      const max = getDateAsString({ value: range?.dateMax, format: dateFormat });
      return `${min} - ${max}`;
    }
  } else if ([PropertyType.FORMULA].includes(property.type)) {
    if (property.formula?.resultAs === "number") {
      const numberFormat = property.attributes.find((f) => f.name === PropertyAttributeName.FormatNumber)?.value as NumberFormatType;
      return getNumberAsStringValue({ value: value as number, format: numberFormat });
    } else if (property.formula?.resultAs === "boolean") {
      const format = property.attributes.find((f) => f.name === PropertyAttributeName.FormatBoolean)?.value;
      return getBooleanAsStringValue({ value: value as boolean, format: format as BooleanFormatType, t });
    } else if (property.formula?.resultAs === "date") {
      const format = property.attributes.find((f) => f.name === PropertyAttributeName.FormatDate)?.value;
      return getDateAsString({ value: value as Date, format: format as DateFormatType });
    } else {
      return value?.toString();
    }
  } else if (property.type === PropertyType.NUMBER) {
    const format = property.attributes.find((f) => f.name === PropertyAttributeName.FormatNumber)?.value;
    return getNumberAsStringValue({ value: value as number, format: format as NumberFormatType });
  } else if (property.type === PropertyType.DATE) {
    const format = property.attributes.find((f) => f.name === PropertyAttributeName.FormatDate)?.value;
    return getDateAsString({ value: value as Date, format: format as DateFormatType });
  } else if (property.type === PropertyType.MEDIA) {
    const media = value as MediaDto[];
    function getFileName(name: string) {
      let fileName = name;
      if (name.includes("/")) {
        fileName = name.split("/").pop() ?? name;
      }
      if (name.includes("\\")) {
        fileName = name.split("\\").pop() ?? name;
      }
      return fileName;
    }
    return media.map((f) => getFileName(f.title)).join(", ");
  }
  return "";
};

const getPropertyValue = ({
  entity,
  item,
  property,
  propertyName,
}: {
  entity: Entity & {
    properties: (Property & { formula?: null | { name: string; resultAs: string; calculationTrigger: string } })[];
  };
  item: { values: RowValueWithDetails[] } | null;
  property?: Property & { formula?: null | { name: string; resultAs: string; calculationTrigger: string } };
  propertyName?: string;
}): string | number | boolean | RowMedia[] | RowValueMultiple[] | RowValueRange | Date | null => {
  if (!property) {
    property = entity.properties.find((f) => f.name === propertyName);
  }
  if (!property) {
    return null;
  }
  const value = item?.values?.find((f) => f?.propertyId === property?.id);
  if (value) {
    if (property.type === PropertyType.FORMULA) {
      const resultAs = FormulaHelpers.getResultAs(property.formula?.resultAs ?? "");
      switch (resultAs) {
        case "number":
          return getDynamicPropertyValue(value, PropertyType.NUMBER);
        case "string":
          return getDynamicPropertyValue(value, PropertyType.TEXT);
        case "date":
          return getDynamicPropertyValue(value, PropertyType.DATE);
        case "boolean":
          return getDynamicPropertyValue(value, PropertyType.BOOLEAN);
        default:
          return null;
      }
    } else {
      return getDynamicPropertyValue(value, property.type);
    }
  }
  try {
    if (!item) {
      return null;
    }
    const object = item[entity?.name as keyof typeof item];
    if (object) {
      // DEPRECATED
      // return object[property.name as keyof typeof object];
    }
    return null;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`Error getting row value.`, { entity: entity?.name, property: property.name });
    return null;
  }
};

const getProperties = (entity: EntityWithProperties, item: RowWithValues | null) => {
  const customProperties: any = {};
  entity.properties
    .filter((f) => !f.isHidden)
    .forEach((property) => {
      if (property.type === PropertyType.MEDIA) {
        const media = (getPropertyValue({ entity, item, property }) ?? []) as RowMedia[];
        const max = property.attributes.find((f) => f.name === PropertyAttributeName.Max);
        if (max?.value && Number(max.value) === 1) {
          if (media?.length > 0) {
            customProperties[property.name] = media[0].publicUrl ?? media[0].file;
          } else {
            customProperties[property.name] = "";
          }
        } else {
          customProperties[property.name] = media.map((item) => item.publicUrl ?? item.file);
        }
      } else {
        const value = getPropertyValue({ entity, item, property });
        customProperties[property.name] = value;
      }
    });
  return customProperties;
};

function getDynamicPropertyValue(item: RowValue & { media: RowMedia[]; multiple: RowValueMultiple[]; range: RowValueRange | null }, type: PropertyType) {
  switch (type) {
    case PropertyType.NUMBER:
      if (item.numberValue === null || isNaN(Number(item.numberValue))) {
        return null;
      }
      return Number(item.numberValue);
    case PropertyType.TEXT:
    case PropertyType.SELECT:
      // case PropertyType.FORMULA:
      return item.textValue;
    case PropertyType.DATE:
      return item.dateValue;
    case PropertyType.BOOLEAN:
      return item.booleanValue;
    // case PropertyType.ROLE:
    // case PropertyType.USER:
    case PropertyType.MEDIA:
      return item.media;
    case PropertyType.MULTI_SELECT:
    case PropertyType.MULTI_TEXT:
      return item.multiple;
    case PropertyType.RANGE_NUMBER:
    case PropertyType.RANGE_DATE:
      return item.range;
    default:
      return "Not supported";
  }
}

function getDetailFormattedValue(entity: EntityWithDetails, item: RowWithValues, property: PropertyWithDetails) {
  const value = getPropertyValue({ entity, item, property });
  if (value) {
    return getFormattedValue(value, property.type);
  }
  return "";
}

function getFormattedValue(value: any, type: PropertyType): string {
  switch (type) {
    case PropertyType.NUMBER:
      if (value === null || isNaN(value)) {
        return "";
      }
      return NumberUtils.decimalFormat(Number(value));
    case PropertyType.TEXT:
    case PropertyType.SELECT:
      // case PropertyType.FORMULA:
      return value;
    case PropertyType.BOOLEAN:
      return value ? "t" : "f";
    case PropertyType.DATE:
      if (!value) {
        return "";
      }
      try {
        const date = new Date(value);
        return date.toISOString().split("T")[0];
      } catch (e: any) {
        return value.toISOString().split("T")[0];
      }
    // case PropertyType.ROLE:
    // case PropertyType.USER:
    // case PropertyType.ID:
    //   return value;
    case PropertyType.MEDIA:
      return value?.length ?? "0";
    default:
      return "Not supported";
  }
}

const getRowFolio = (entity: Entity, item: { folio: number }) => {
  return `${entity?.prefix}-${NumberUtils.pad(item?.folio ?? 0, 4)}`.toUpperCase();
};

const getTextDescription = ({
  entity,
  item,
  t,
  defaultsToFolio = true,
  includeFolio,
}: {
  entity: EntityWithDetails;
  item: { id: string; folio: number; values: RowValueWithDetails[] };
  t?: TFunction;
  defaultsToFolio?: boolean;
  includeFolio?: boolean;
}): string => {
  const descriptions: string[] = [];
  entity.properties
    .filter((f) => !f.isDefault && f.isDisplay)
    .forEach((property) => {
      const value = getValueAsString({ entity, item, property, t });
      if (value) {
        descriptions.push(value);
      }
    });
  if (descriptions.length > 0) {
    if (includeFolio) {
      descriptions.push(getRowFolio(entity, item));
    }
    return descriptions.join(" • ");
  }
  return defaultsToFolio || includeFolio ? getRowFolio(entity, item) : "";
};

const getFirstProperty = ({ entity, item }: { entity: EntityWithDetails; item: RowWithValues }) => {
  let displayProperties = entity.properties.sort((a, b) => a.order - b.order).filter((f) => f.isDisplay);
  if (displayProperties.length > 0) {
    const property = displayProperties[0];
    const value = getCellValue({ entity, item, property });
    return value;
  } else {
    return getRowFolio(entity, item);
  }
};

const search = (entity: EntityWithDetails, item: RowWithValues, searchInput: string) => {
  if (!searchInput || searchInput.trim() === "") {
    return true;
  }
  const properties = entity.properties.filter((f) => !f.isHidden);
  for (let idx = 0; idx < properties.length; idx++) {
    const property = properties[idx];
    const rowValue = getPropertyValue({ entity, item, property });
    if (rowValue?.toString()?.toUpperCase().trim().includes(searchInput.toUpperCase().trim())) {
      return true;
    }
  }

  if (
    getRowFolio(entity, item)?.toUpperCase().includes(searchInput.toUpperCase()) ||
    item.createdByUser?.email?.toUpperCase().includes(searchInput.toUpperCase()) ||
    (item.createdByUser?.firstName + " " + item.createdByUser?.lastName)?.toUpperCase().includes(searchInput.toUpperCase())
  ) {
    return true;
  }
  return false;
};

const updateFieldValueTypeArray = (item: RowValueDto, value: any) => {
  return getValueFromType(item.property.type, value);
};

const getValueFromType = (type: PropertyType, value: any) => {
  switch (type) {
    case PropertyType.NUMBER:
      if (typeof value === "string") {
        return { numberValue: !value ? null : Number(value) };
      }
      return { numberValue: value ?? null };
    case PropertyType.TEXT:
    case PropertyType.SELECT:
      // case PropertyType.FORMULA:
      return { textValue: value };
    case PropertyType.DATE:
      if (value === null || value === undefined || value === "") {
        return { dateValue: undefined };
      } else {
        return { dateValue: new Date(value) };
      }
    case PropertyType.BOOLEAN:
      return { booleanValue: value === "true" || value === true };
    case PropertyType.MEDIA:
      return { media: value };
    // case PropertyType.USER:
    // case PropertyType.ROLE:
    //   return { idValue: value };
    case PropertyType.MULTI_SELECT:
    case PropertyType.MULTI_TEXT:
      return { multiple: value };
    case PropertyType.RANGE_NUMBER:
    case PropertyType.RANGE_DATE:
      return { range: value };
    case PropertyType.FORMULA:
      return { textValue: value };
    default:
      return {};
  }
};

export type RowValueCreateDto = {
  name: string;
  value?: string;
  media?: MediaDto[];
  multiple?: RowValueMultipleDto[];
  range?: RowValueRangeDto;
};
const getRowPropertiesFromForm = ({
  t,
  entity,
  form,
  values,
  existing,
  options,
}: {
  t?: TFunction;
  entity: EntityWithDetails;
  form?: FormData;
  values?: RowValueCreateDto[];
  existing?: RowWithValues;
  options?: {
    skipValidation?: boolean;
  };
}): {
  dynamicProperties: RowValueDto[];
  properties: any;
  parentRows?: { relationshipId: string; parentId: string }[];
  childRows?: { relationshipId: string; childId: string }[];
} => {
  const dynamicProperties: RowValueDto[] = [];

  entity.properties
    .filter((f) => !f.isHidden && !f.isDefault)
    .forEach((property) => {
      let formValue: FormDataEntryValue | null = null;
      let media: MediaDto[] = [];
      let multiple: RowValueMultipleDto[] = [];
      let range: RowValueRangeDto | null = null;
      let name = property.name;
      const propertyValue = values?.find((f) => f.name === name);
      if ([PropertyType.MEDIA, PropertyType.MULTI_SELECT, PropertyType.MULTI_TEXT].includes(property.type)) {
        name += "[]";
      }
      if ([PropertyType.RANGE_NUMBER, PropertyType.RANGE_DATE].includes(property.type)) {
        if (propertyValue?.range) {
          range = propertyValue.range;
        } else {
          const min = getFormDataEntryValue({ name: name + "-min", form, values });
          const max = getFormDataEntryValue({ name: name + "-max", form, values });
          if (PropertyType.RANGE_NUMBER === property.type) {
            range = {
              numberMin: Number(min ?? 0),
              numberMax: Number(max ?? 0),
              dateMin: null,
              dateMax: null,
            };
          } else if (PropertyType.RANGE_DATE === property.type) {
            range = {
              numberMin: null,
              numberMax: null,
              dateMin: min ? new Date(min?.toString()) : null,
              dateMax: max ? new Date(max?.toString()) : null,
            };
          }
        }
      } else if (property.type === PropertyType.MEDIA) {
        if (propertyValue?.media) {
          media = propertyValue.media;
        } else {
          media = getFormDataEntryValues({ name, form, values }).map((f: FormDataEntryValue) => {
            return JSON.parse(f.toString());
          });
        }
        if (!options?.skipValidation) {
          validatePropertyValue_Media({ t, property, media });
        }
      } else if ([PropertyType.MULTI_SELECT, PropertyType.MULTI_TEXT].includes(property.type)) {
        if (propertyValue?.multiple) {
          multiple = propertyValue.multiple;
        } else {
          multiple = getFormDataEntryValues({ name, form, values }).map((f: FormDataEntryValue) => {
            return JSON.parse(f.toString());
          });
        }
        if (!options?.skipValidation) {
          validatePropertyValue_Multiple({ t, property, multiple });
        }
      } else {
        formValue = getFormDataEntryValue({ name, form, values });
        if (!options?.skipValidation) {
          if (property.isRequired && !property.isReadOnly && (formValue === null || formValue === undefined || !formValue)) {
            if (t) {
              throw Error(`${t(property.title)}: required`);
            } else {
              throw Error(`${property.name}: required`);
            }
          }
          validatePropertyValue({ t, property, value: formValue });
        }
      }
      const value = getValueFromType(property.type, formValue);
      value.media = media;
      value.multiple = multiple;
      value.range = range;

      let hasFormValue = formValue !== null && formValue !== undefined;
      if (property.type === PropertyType.MEDIA) {
        hasFormValue = media.length > 0;
      } else if ([PropertyType.MULTI_SELECT, PropertyType.MULTI_TEXT].includes(property.type)) {
        hasFormValue = multiple.length > 0;
      } else if ([PropertyType.RANGE_NUMBER, PropertyType.RANGE_DATE].includes(property.type)) {
        hasFormValue = range !== null;
      }
      if (!hasFormValue) {
        if (!property.isRequired) {
          return;
        } else if (property.isReadOnly) {
          return;
        } else if (!property.canUpdate && existing) {
          return;
        }
      }

      const existingValue = existing?.values?.find((f) => f.propertyId === property.id);
      const rowValue = {
        id: existingValue?.id ?? null,
        propertyId: property.id,
        property: property,
        ...value,
      };
      dynamicProperties.push(rowValue);
    });

  let parentRows: { relationshipId: string; parentId: string }[] | undefined = undefined;
  let childRows: { relationshipId: string; childId: string }[] | undefined = undefined;

  entity.parentEntities.forEach((relationship) => {
    let name = "parents[" + relationship.parent.name + "]";
    if (form?.has(name)) {
      parentRows = parentRows ?? [];
    }
    const rowIds = getFormDataEntryValues({ name, form, values }).map((f) => f.toString());
    const parentRowIds = rowIds.map((parentId) => {
      return { relationshipId: relationship.id, parentId };
    });
    if (relationship.required && parentRowIds.length === 0) {
      throw Error(`${t ? t(relationship.parent.title) : relationship.parent.name}: required`);
    }
    parentRows = parentRows?.concat(parentRowIds);
    // if (relationship.required && parentRowIds.length === 0) {
    //   throw Error(`${t ? t(RelationshipHelper.getTitle({ fromEntityId: entity.id, relationship })) : relationship.parent.name}: required`);
    // }
  });

  entity.childEntities.forEach((relationship) => {
    let name = "children[" + relationship.child.name + "]";
    if (form?.has(name)) {
      childRows = childRows ?? [];
    }
    const rowIds = getFormDataEntryValues({ name, form, values }).map((f) => f.toString());
    const childRowIds = rowIds.map((childId) => {
      return { relationshipId: relationship.id, childId };
    });
    childRows = childRows?.concat(childRowIds);
  });

  return {
    dynamicProperties,
    properties: {},
    parentRows,
    childRows,
  };
};

function getFormDataEntryValue({
  name,
  form,
  values,
}: {
  name: string;
  form?: FormData;
  values?: { name: string; value?: string }[];
}): FormDataEntryValue | null {
  if (form) {
    return form.get(name);
  } else {
    return values?.find((f) => f.name === name)?.value ?? null;
  }
}

function getFormDataEntryValues({ name, form, values }: { name: string; form?: FormData; values?: { name: string; value?: string }[] }): FormDataEntryValue[] {
  let entries: FormDataEntryValue[] = [];
  if (form) {
    entries = form.getAll(name);
  } else {
    entries = values?.filter((f) => f.name === name).map((f) => f.value ?? "") ?? [];
  }
  return entries;
}

const getPropertyDefaultValue = (property: Property): string | number | boolean | RowMedia[] | RowValueMultiple[] | RowValueRange | Date | null => {
  switch (property.type) {
    case PropertyType.NUMBER:
      return 0;
    case PropertyType.TEXT:
    case PropertyType.SELECT:
      return "";
    case PropertyType.DATE:
      return null;
    case PropertyType.BOOLEAN:
      return false;
    case PropertyType.MEDIA:
      return [];
    case PropertyType.MULTI_SELECT:
    case PropertyType.MULTI_TEXT:
      return [];
    case PropertyType.RANGE_NUMBER:
    case PropertyType.RANGE_DATE:
      return {
        rowValueId: "",
        numberMin: null,
        numberMax: null,
        dateMin: null,
        dateMax: null,
      };
    case PropertyType.FORMULA:
      return null;
    default:
      return "Not supported";
  }
};

const getFakePropertyValue = ({ property, idx, t }: { property: PropertyWithDetails; idx: number; t: TFunction }): RowValueWithDetails => {
  let sampleText = `${t(property.title)} ${idx}`;
  const rowValue: RowValueWithDetails = {
    id: "1",
    createdAt: new Date(),
    updatedAt: null,
    rowId: "1",
    propertyId: property.id,
    textValue: null,
    numberValue: null,
    dateValue: null,
    booleanValue: null,
    media: [],
    multiple: [],
    range: null,
  };
  switch (property.type) {
    case PropertyType.FORMULA: {
      const resultAs = FormulaHelpers.getResultAs(property.formula?.resultAs ?? "");
      switch (resultAs) {
        case "number":
          rowValue.numberValue = new Decimal(123);
          break;
        case "string":
          rowValue.textValue = sampleText;
          break;
        case "date":
          rowValue.dateValue = new Date();
          break;
        case "boolean":
          rowValue.booleanValue = true;
          break;
        default:
          break;
      }
    }
    case PropertyType.NUMBER:
      rowValue.numberValue = new Decimal(123 * idx);
      break;
    case PropertyType.TEXT:
      if (property.subtype === "email") {
        rowValue.textValue = `john.doe.${idx}@company.com`;
      } else if (property.subtype === "url") {
        rowValue.textValue = "https://saasrock.com";
      } else if (property.subtype === "phone") {
        rowValue.textValue = "+1 123 456 7890";
      } else {
        rowValue.textValue = sampleText;
      }
      break;
    case PropertyType.SELECT:
      if (property.options.length > 0) {
        rowValue.textValue = property.options[0].value;
      } else {
        rowValue.textValue = sampleText;
      }
      break;
    case PropertyType.DATE:
      rowValue.dateValue = new Date();
      break;
    case PropertyType.BOOLEAN:
      rowValue.booleanValue = true;
      break;
    case PropertyType.MEDIA:
      const media: RowMedia[] = [
        {
          id: "1",
          rowValueId: "",
          file: "",
          type: "image/png",
          name: "Image 1.png",
          title: "Image 1",
          publicUrl: "https://via.placeholder.com/150",
          storageBucket: null,
          storageProvider: null,
        },
      ];
      rowValue.media = media;
      break;
    case PropertyType.MULTI_TEXT: {
      let multiple: RowValueMultiple[] = [
        { id: "1", rowValueId: "", order: 1, value: sampleText },
        { id: "2", rowValueId: "", order: 2, value: sampleText },
      ];
      rowValue.multiple = multiple;
      break;
    }
    case PropertyType.MULTI_SELECT: {
      let multiple: RowValueMultiple[] = [
        { id: "1", rowValueId: "", order: 1, value: sampleText },
        { id: "2", rowValueId: "", order: 2, value: sampleText },
      ];
      if (property.options.length > 0) {
        multiple = property.options.map((option, index) => {
          return { id: `${index}`, rowValueId: "", order: index, value: option.value };
        });
      }
      rowValue.multiple = multiple;
      break;
    }
    case PropertyType.RANGE_NUMBER:
      const rangeNumber = {
        rowValueId: "",
        numberMin: new Decimal(100),
        numberMax: new Decimal(200),
        dateMin: null,
        dateMax: null,
      };
      rowValue.range = rangeNumber;
      break;
    case PropertyType.RANGE_DATE:
      const rangeDate = {
        rowValueId: "",
        numberMin: null,
        numberMax: null,
        dateMin: new Date(),
        dateMax: new Date(),
      };
      rowValue.range = rangeDate;
      break;
  }
  return rowValue;
};

const getDiff = ({ entity, before, after }: { entity: EntityWithProperties; before: RowWithValues; after: RowWithValues }) => {
  const propertiesToCheck = entity.properties.filter((f) => !f.isDefault);
  const diff: { [key: string]: { before: any; after: any } } = {};
  propertiesToCheck.forEach((property) => {
    const beforeValue = getFormattedValue(getPropertyValue({ entity, item: before, property }), property.type);
    const afterValue = getFormattedValue(getPropertyValue({ entity, item: after, property }), property.type);
    if (beforeValue !== afterValue) {
      diff[property.name] = { before: beforeValue, after: afterValue };
    }
  });
  return diff;
};

export default {
  getCellValue,
  getPropertyValue,
  getDetailFormattedValue,
  getFormattedValue,
  getRowFolio,
  search,
  updateFieldValueTypeArray,
  getValueFromType,
  getProperties,
  getDynamicPropertyValue,
  getRowPropertiesFromForm,
  getFirstProperty,
  getTextDescription,
  getPropertyDefaultValue,
  getFakePropertyValue,
  getValueAsString,
  getDiff,
};
