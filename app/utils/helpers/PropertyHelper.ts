import { Property } from "@prisma/client";
import { TFunction } from "i18next";
import { MediaDto } from "~/application/dtos/entities/MediaDto";
import { PropertyAttributeName } from "~/application/enums/entities/PropertyAttributeName";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import { TemplateEntityPropertyTypeDto } from "~/modules/templates/EntityTemplateDto";
import { EntityWithProperties, PropertyWithDetails } from "../db/entities/entities.db.server";
import PropertyAttributeHelper from "./PropertyAttributeHelper";
import { RowValueMultipleDto } from "~/application/dtos/entities/RowValueMultipleDto";

export const validateProperty = async (name: string, title: string, properties: Property[], property?: Property | null) => {
  const errors: string[] = [];

  if (!property || property?.name !== name) {
    const existingName = properties.find((f) => f.name === name);
    if (existingName) {
      errors.push(`Existing property with name '${name}': ${existingName.title}`);
    }
  }

  if (!property || property?.title !== title) {
    const existingTitle = properties.find((f) => f.title === title);
    if (existingTitle) {
      errors.push(`Existing entity with title '${title}': ${existingTitle.title}`);
    }
  }

  return errors;
};

export const defaultProperties: {
  order: number;
  name: string;
  title: string;
  type: number;
  // formula?: string | null;
  parentId?: string | null;
  isDefault: boolean;
  isRequired: boolean;
  isHidden: boolean;
  isDisplay: boolean;
}[] = [
  {
    name: "id",
    title: "ID",
    order: 1,
    type: PropertyType.NUMBER,
    // options: [],
    isDefault: true,
    isRequired: false,
    isHidden: true,
    // formula: undefined,
    isDisplay: false,
  },
  {
    name: "folio",
    title: "models.row.folio",
    order: 2,
    type: PropertyType.NUMBER,
    // options: [],
    isDefault: true,
    isRequired: false,
    isHidden: true,
    // formula: undefined,
    isDisplay: false,
  },
  {
    name: "createdAt",
    title: "Created at",
    order: 3,
    type: PropertyType.DATE,
    // options: [],
    isDefault: true,
    isRequired: false,
    isHidden: true,
    // formula: undefined,
    isDisplay: false,
  },
  // {
  //   name: "createdByUser",
  //   title: "Created by user",
  //   order: 4,
  //   type: PropertyType.USER,
  //   // options: [],
  //   isDefault: true,
  //   isRequired: false,
  //   isHidden: true,
  //   formula: undefined,
  // },
  // {
  //   name: "role",
  //   title: "Created by role",
  //   order: 4,
  //   type: PropertyType.ROLE,
  //   // options: [],
  //   isDefault: true,
  //   isRequired: false,
  //   isHidden: true,
  //   formula: undefined,
  // },
  // {
  //   name: "name",
  //   title: "Name",
  //   order: 5,
  //   type: PropertyType.TEXT,
  //   // options: [],
  //   isDefault: true,
  //   isRequired: false,
  //   isHidden: true,
  //   formula: undefined,
  // },
  // {
  //   name: "total",
  //   title: "Total",
  //   order: 6,
  //   type: PropertyType.NUMBER,
  //   // options: [],
  //   isDefault: true,
  //   isRequired: false,
  //   isHidden: true,
  //   formula: undefined,
  // },
];

export function validatePropertyValue({ t, property, value }: { t?: TFunction; property: PropertyWithDetails; value: any }) {
  const max = PropertyAttributeHelper.getPropertyAttributeValue_Number(property, PropertyAttributeName.Max);
  const min = PropertyAttributeHelper.getPropertyAttributeValue_Number(property, PropertyAttributeName.Min);
  if (max) {
    if (property.type === PropertyType.TEXT) {
      if (value.length > max) {
        throwError({ t, property, error: `must have less than ${max} characters (${value})` });
      }
    } else if (property.type === PropertyType.NUMBER) {
      if (!!value && Number(value) > max) {
        throwError({ t, property, error: `must be less than ${max} (${value})` });
      }
    }
  }
  if (min) {
    if (property.type === PropertyType.TEXT) {
      if (value.length < min) {
        throwError({ t, property, error: `must have less than ${min} characters (${value})` });
      }
    } else if (property.type === PropertyType.NUMBER) {
      if (!!value && Number(value) < min) {
        throwError({ t, property, error: `must be greater than ${min} (${value})` });
      }
    }
  }
  return true;
}

function throwError({ t, property, error }: { t?: TFunction; property: Property; error: string }) {
  if (t) {
    throw Error(`${t(property.title)}: ${error}`);
  }
  throw Error(`${property.name}: ${error}`);
}

export function validatePropertyValue_Media({ t, property, media }: { t?: TFunction; property: PropertyWithDetails; media: MediaDto[] }) {
  const max = PropertyAttributeHelper.getPropertyAttributeValue_Number(property, PropertyAttributeName.Max);
  const min = PropertyAttributeHelper.getPropertyAttributeValue_Number(property, PropertyAttributeName.Min);
  if (property.isRequired && media.length === 0) {
    throwError({ t, property, error: `required` });
  } else if (max && media.length > max) {
    if (max === 1) {
      throwError({ t, property, error: `can only have one file` });
    } else {
      throwError({ t, property, error: `cannot have more than ${max} files` });
    }
  } else if (min && media.length < min) {
    if (min === 1) {
      throwError({ t, property, error: `must have at least one file` });
    } else {
      throwError({ t, property, error: `must have at least ${min} files` });
    }
  }
  return true;
}

export function validatePropertyValue_Multiple({ t, property, multiple }: { t?: TFunction; property: PropertyWithDetails; multiple: RowValueMultipleDto[] }) {
  const max = PropertyAttributeHelper.getPropertyAttributeValue_Number(property, PropertyAttributeName.Max);
  const min = PropertyAttributeHelper.getPropertyAttributeValue_Number(property, PropertyAttributeName.Min);
  if (property.isRequired && multiple.length === 0) {
    throwError({ t, property, error: `required` });
  } else if (max && multiple.length > max) {
    if (max === 1) {
      throwError({ t, property, error: `can only have one` });
    } else {
      throwError({ t, property, error: `cannot have more than ${max}` });
    }
  } else if (min && multiple.length < min) {
    if (min === 1) {
      throwError({ t, property, error: `must have at least one` });
    } else {
      throwError({ t, property, error: `must have at least ${min}` });
    }
  }
  return true;
}

export function mapToEntityTemplateType(type: PropertyType): TemplateEntityPropertyTypeDto {
  switch (type) {
    case PropertyType.NUMBER:
      return "number";
    case PropertyType.TEXT:
      return "string";
    case PropertyType.DATE:
      return "date";
    case PropertyType.MEDIA:
      return "media";
    case PropertyType.SELECT:
      return "select";
    case PropertyType.BOOLEAN:
      return "boolean";
    case PropertyType.MULTI_SELECT:
      return "multiSelect";
    case PropertyType.MULTI_TEXT:
      return "multiText";
    case PropertyType.RANGE_NUMBER:
      return "rangeNumber";
    case PropertyType.RANGE_DATE:
      return "rangeDate";
    case PropertyType.FORMULA:
      return "formula";
    default:
      return "string";
  }
}

export enum RowDisplayDefaultProperty {
  ID = "default.id",
  ENTITY = "default.entity",
  TENANT = "default.tenant",
  ORDER = "default.order",
  FOLIO = "default.folio",
  CREATED_AT = "default.createdAt",
  CREATED_BY = "default.createdBy",
  PERMISSIONS = "default.permissions",
  TAGS = "default.tags",
  TASKS = "default.tasks",
  COMMENTS = "default.comments",
  HIDDEN_PARENTS = "default.hiddenParents",
  HIDDEN_CHILDREN = "default.hiddenChildren",
}
export const defaultDisplayProperties: { name: string; title: string; position: "before" | "after"; displayedByDefault: boolean }[] = [
  { name: RowDisplayDefaultProperty.ID, title: "ID", position: "before", displayedByDefault: false },
  { name: RowDisplayDefaultProperty.ENTITY, title: "models.row.entity", position: "before", displayedByDefault: false },
  { name: RowDisplayDefaultProperty.TENANT, title: "models.row.tenant", position: "before", displayedByDefault: false },
  { name: RowDisplayDefaultProperty.ORDER, title: "models.row.order", position: "before", displayedByDefault: false },
  { name: RowDisplayDefaultProperty.FOLIO, title: "models.row.folio", position: "before", displayedByDefault: true },
  { name: RowDisplayDefaultProperty.CREATED_AT, title: "models.row.createdAt", position: "after", displayedByDefault: true },
  { name: RowDisplayDefaultProperty.CREATED_BY, title: "models.row.createdBy", position: "after", displayedByDefault: true },
  { name: RowDisplayDefaultProperty.PERMISSIONS, title: "models.row.permissions", position: "after", displayedByDefault: false },
  { name: RowDisplayDefaultProperty.TAGS, title: "models.row.tags", position: "after", displayedByDefault: false },
  { name: RowDisplayDefaultProperty.TASKS, title: "models.row.tasks", position: "after", displayedByDefault: false },
  { name: RowDisplayDefaultProperty.COMMENTS, title: "models.row.comments", position: "after", displayedByDefault: false },
  { name: RowDisplayDefaultProperty.HIDDEN_PARENTS, title: "", position: "after", displayedByDefault: false },
  { name: RowDisplayDefaultProperty.HIDDEN_CHILDREN, title: "", position: "after", displayedByDefault: false },
];

export function getFormProperties({ mode, entity, properties }: { mode: "create" | "edit"; entity: EntityWithProperties; properties?: string[] }) {
  let items = entity.properties.filter((f) => !f.isDefault && !f.isHidden && (properties === undefined || properties.includes(f.name)));
  if (mode === "create") {
    items = items.filter((f) => f.showInCreate);
  }
  return items;
}
