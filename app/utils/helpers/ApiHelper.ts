import { MediaDto } from "~/application/dtos/entities/MediaDto";
import { RowValueDto } from "~/application/dtos/entities/RowValueDto";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import { EntityWithDetails, EntityWithProperties, PropertyWithDetails } from "../db/entities/entities.db.server";
import { RowWithDetails, RowWithValues } from "../db/entities/rows.db.server";
import RowHelper from "./RowHelper";
import { v4 as uuid } from "uuid";
import bcrypt from "bcryptjs";
import { TFunction } from "i18next";
import { validatePropertyValue, validatePropertyValue_Media, validatePropertyValue_Multiple } from "./PropertyHelper";
import PropertyAttributeHelper from "./PropertyAttributeHelper";
import { PropertyAttributeName } from "~/application/enums/entities/PropertyAttributeName";
import { EntityRelationshipWithDetails } from "../db/entities/entityRelationships.db.server";
import RelationshipHelper from "./RelationshipHelper";
import { RowMedia, RowValueMultiple, RowValueRange } from "@prisma/client";
import { RowValueMultipleDto } from "~/application/dtos/entities/RowValueMultipleDto";
import { RowValueRangeDto } from "~/application/dtos/entities/RowValueRangeDto";

const generateKey = () => {
  const id: string = uuid();
  return id;
};

const hashKey = async (key: string) => {
  return await bcrypt.hash(key, 10);
};

const validateKey = async (key: string, hashedKey: string) => {
  return await bcrypt.compare(key, hashedKey);
};

const getRowPropertiesFromJson = (t: TFunction | undefined, entity: EntityWithDetails, jsonObject: any, existing?: RowWithDetails) => {
  const dynamicProperties: RowValueDto[] = [];
  const properties: any = {};

  entity.properties
    .filter((f) => !f.isHidden)
    .forEach((property) => {
      const propertyValue = getPropertyValueFromJson(t, property, jsonObject, existing);
      if (propertyValue?.rowValue) {
        dynamicProperties.push(propertyValue?.rowValue);
      }
    });

  return {
    dynamicProperties,
    properties,
  };
};

function getPropertyValueFromJson(t: TFunction | undefined, property: PropertyWithDetails, object: any, existing?: RowWithDetails) {
  let jsonValue: any | null = null;
  let media: MediaDto[] = [];
  let multiple: RowValueMultipleDto[] = [];
  let range: RowValueRangeDto | null = null;

  let name = property.name;
  if (property.type === PropertyType.RANGE_NUMBER) {
    try {
      range = {
        numberMin: object[name]?.min ?? null,
        numberMax: object[name]?.min ?? null,
        dateMin: null,
        dateMax: null,
      };
    } catch (e: any) {
      throw Error(`Invalid number range (${property.name}): ${e.message}`);
    }
  } else if (property.type === PropertyType.RANGE_DATE) {
    try {
      const min = object[name]?.min;
      const max = object[name]?.max;
      range = {
        numberMin: null,
        numberMax: null,
        dateMin: min ? new Date(min?.toString()) : null,
        dateMax: max ? new Date(max?.toString()) : null,
      };
    } catch (e: any) {
      throw Error(`Invalid date range (${property.name}): ${e.message}`);
    }
  } else if ([PropertyType.MULTI_SELECT, PropertyType.MULTI_TEXT].includes(property.type)) {
    multiple =
      object[name]?.map((f: string, idx: number) => {
        const value: RowValueMultipleDto = {
          order: idx + 1,
          value: f,
        };
        return value;
      }) ?? [];
    validatePropertyValue_Multiple({ t, property, multiple });
  } else if (property.type === PropertyType.MEDIA) {
    media =
      object[name]?.map((f: MediaDto) => {
        return f;
      }) ?? [];
    validatePropertyValue_Media({ t, property, media });
  } else {
    jsonValue = object[name];
    if (property.isRequired && !property.isRequired && (jsonValue === null || jsonValue === undefined || jsonValue === "")) {
      const defaultValue = PropertyAttributeHelper.getPropertyAttributeValue_String(property, PropertyAttributeName.DefaultValue);
      if (defaultValue) {
        jsonValue = defaultValue;
      } else {
        if (existing && !object.hasOwnProperty(name)) {
          return null;
        }
        if (t) {
          throw Error(`${t(property.title)}: required`);
        } else {
          throw Error(`${property.name}: required`);
        }
      }
    }
    validatePropertyValue({ t, property, value: jsonValue });
  }
  const value = RowHelper.getValueFromType(property.type, jsonValue);
  value.media = media;
  value.multiple = multiple;
  value.range = range;
  const existingValue = existing?.values.find((f) => f.propertyId === property.id);
  const rowValue: RowValueDto = {
    id: existingValue?.id ?? null,
    propertyId: property.id,
    property: property,
    ...value,
  };
  return { rowValue };
}

const getApiFormat = (entity: EntityWithProperties, item: RowWithValues | null, options: ApiFormatOptions = {}) => {
  if (item === null) {
    return null;
  }
  let properties: any = {};
  entity.properties
    .filter((f) => !f.isDefault)
    .forEach((property) => {
      const value = getPropertyApiFormat({ entity, property, item });
      properties[property.name] = value;
    });
  const object: any = {
    id: item.id,
    folio: RowHelper.getRowFolio(entity, item),
    ...properties,
    createdAt: item.createdAt,
    createdByUser: item.createdByUser
      ? {
          id: item.createdByUserId,
          email: item.createdByUser.email,
          firstName: item.createdByUser.firstName,
          lastName: item.createdByUser.lastName,
        }
      : null,
    createdByApiKey: item.createdByApiKey
      ? {
          alias: item.createdByApiKey.alias,
        }
      : null,
  };
  options?.exclude?.forEach((toExclude) => {
    delete object[toExclude];
  });
  return object;
};

export type ApiFormatOptions = {
  exclude?: string[];
};
function getApiFormatWithRelationships({
  entities,
  item,
  options,
  originalParentId,
}: {
  entities: EntityWithDetails[];
  item: RowWithDetails | null;
  options?: ApiFormatOptions;
  originalParentId?: string;
}) {
  if (!item) {
    return null;
  }
  const entity = entities.find((f) => f.id === item.entityId);
  if (entity === undefined) {
    return null;
  }
  const apiFormat = getApiFormat(entity, item, options);

  Object.assign(
    apiFormat,
    getRelationship({ entity, entities, relationships: entity.parentEntities, type: "parent", item, options, originalParentId: originalParentId ?? item.id })
  );
  Object.assign(
    apiFormat,
    getRelationship({ entity, entities, relationships: entity.childEntities, type: "child", item, options, originalParentId: originalParentId ?? item.id })
  );

  return apiFormat;
}

function getRelationship({
  entity,
  entities,
  relationships,
  type,
  item,
  options,
  originalParentId,
}: {
  entity: EntityWithDetails;
  entities: EntityWithDetails[];
  relationships: EntityRelationshipWithDetails[];
  type: "parent" | "child";
  item: RowWithDetails;
  options?: ApiFormatOptions;
  originalParentId: string;
}) {
  const fromEntityId = entity.id;
  const apiFormat: any = {};
  relationships.forEach((relationship) => {
    const { id, parent, child } = relationship;
    const multiple = RelationshipHelper.getInputType({ fromEntityId, relationship }) === "multi-select";
    const entity = entities.find((e) => e.id === (type === "parent" ? parent.id : child.id));
    if (!entity) {
      return;
    }
    const rows =
      type === "parent"
        ? item.parentRows
            ?.filter((f) => f.parentId !== originalParentId)
            ?.map((f) => {
              return { id: f.id, relationshipId: f.relationshipId, row: f.parent };
            }) ?? []
        : item.childRows
            ?.filter((f) => f.childId !== originalParentId)
            ?.map((f) => {
              return { id: f.id, relationshipId: f.relationshipId, row: f.child };
            }) ?? [];

    if (multiple && entity.id === child.id) {
      apiFormat[entity.name] = [];
      rows
        .filter((f) => f.relationshipId === id)
        .forEach((r) => {
          if (!r.row) {
            return;
          }
          const rowApiFormat = getApiFormat(entity!, r.row, options);
          apiFormat[entity.name].push({
            // relationshipId: r.id,
            ...rowApiFormat,
            ...getApiFormatWithRelationships({ entities, item: r.row as RowWithDetails, options, originalParentId }),
          });
        });
    } else {
      const row = rows?.find((f) => f.relationshipId === id);
      if (row) {
        const rowApiFormat = getApiFormat(entity!, row.row, options);
        apiFormat[entity.name] = {
          // relationshipId: row.id,
          ...rowApiFormat,
          ...getApiFormatWithRelationships({ entities, item: row.row as RowWithDetails, options, originalParentId }),
        };
      } else {
        apiFormat[entity.name] = null;
      }
    }
  });

  return apiFormat;
}

const getPropertyApiFormat = ({ entity, item, property }: { entity: EntityWithProperties; item: RowWithValues; property: PropertyWithDetails }) => {
  const value = RowHelper.getPropertyValue({ entity, item, property });
  if (property.type === PropertyType.TEXT) {
    return value?.toString();
  } else if (property.type === PropertyType.NUMBER) {
    return value as number;
  } else if (property.type === PropertyType.BOOLEAN) {
    return value as boolean;
  } else if (property.type === PropertyType.DATE) {
    let date = value as Date;
    return date?.toISOString();
  } else if (property.type === PropertyType.SELECT) {
    return value?.toString();
  } else if (property.type === PropertyType.MEDIA) {
    const media = value as RowMedia[];
    return (
      media?.map((f) => {
        return {
          id: f.id,
          name: f.name,
          file: f.publicUrl ?? f.file,
          type: f.type,
        };
      }) ?? []
    );
  } else if (property.type === PropertyType.MULTI_SELECT) {
    const multiple = value as RowValueMultiple[];
    return (
      multiple?.map((f) => {
        return f.value;
      }) ?? []
    );
  } else if (property.type === PropertyType.MULTI_TEXT) {
    const multiple = value as RowValueMultiple[];
    return (
      multiple?.map((f) => {
        return f.value;
      }) ?? []
    );
  } else if (property.type === PropertyType.RANGE_NUMBER) {
    const range = value as RowValueRange;
    return {
      min: range?.numberMin ?? null,
      max: range?.numberMax ?? null,
    };
  } else if (property.type === PropertyType.RANGE_DATE) {
    const range = value as RowValueRange;
    return {
      min: range?.dateMin?.toISOString() ?? null,
      max: range?.dateMax?.toISOString() ?? null,
    };
  } else {
    return RowHelper.getPropertyValue({ entity, item, property });
  }
};

function getSchemaType({ property }: { property: PropertyWithDetails }) {
  switch (property.type) {
    case PropertyType.TEXT:
    case PropertyType.SELECT:
      return { type: "string" };

    case PropertyType.NUMBER:
      return { type: "integer" };

    case PropertyType.BOOLEAN:
      return { type: "boolean" };

    case PropertyType.DATE:
      return { type: "string", format: "date" }; // or "date-time" if ISO 8601 format

    case PropertyType.MULTI_SELECT:
    case PropertyType.MULTI_TEXT:
      return { type: "array", items: { type: "string" } };

    case PropertyType.MEDIA:
      return {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            name: { type: "string" },
            file: { type: "string" },
            type: { type: "string" },
          },
        },
      };

    case PropertyType.RANGE_NUMBER:
      return {
        type: "object",
        properties: {
          min: { type: "integer" },
          max: { type: "integer" },
        },
      };

    case PropertyType.RANGE_DATE:
      return {
        type: "object",
        properties: {
          min: { type: "string", format: "date" },
          max: { type: "string", format: "date" },
        },
      };

    default:
      return { type: "string" };
  }
}

function getSampleValue({ property }: { property: PropertyWithDetails }) {
  switch (property.type) {
    case PropertyType.TEXT:
      return "Sample text";
    case PropertyType.NUMBER:
      return 123;
    case PropertyType.BOOLEAN:
      return true;
    case PropertyType.DATE:
      return new Date();
    case PropertyType.SELECT:
      return property.options.length > 0 ? property.options[0].value : "Sample select";
    case PropertyType.MEDIA:
      return [{ name: "My image.png", type: "image/png", title: "My image", file: "https://via.placeholder.com/1000x500.png?text=My%20image" }];
    case PropertyType.MULTI_SELECT:
    case PropertyType.MULTI_TEXT:
      return property.options.map((f) => f.value);
    case PropertyType.RANGE_DATE:
      return { min: new Date(), max: new Date() };
    case PropertyType.RANGE_NUMBER:
      return { min: 1, max: 100 };
    default:
      return "{NOT SUPPORTED}";
  }
}

export default {
  generateKey,
  hashKey,
  validateKey,
  getRowPropertiesFromJson,
  getApiFormat,
  getApiFormatWithRelationships,
  getSchemaType,
  getSampleValue,
};
