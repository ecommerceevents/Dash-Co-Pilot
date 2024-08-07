import { PropertyType } from "~/application/enums/entities/PropertyType";
import { Colors } from "~/application/enums/shared/Colors";
import { defaultProperties } from "~/utils/helpers/PropertyHelper";
import { db } from "../../db.server";

export async function getProperty(id: string) {
  return await db.property.findUnique({
    where: {
      id,
    },
    include: {
      attributes: true,
      options: {
        orderBy: {
          order: "asc",
        },
      },
      formula: true,
    },
  });
}

export async function getEntityPropertyByName(entityId: string, name: string) {
  return await db.property.findFirst({
    where: {
      entityId,
      name,
    },
    include: {
      attributes: true,
      options: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });
}

export async function createProperty(data: {
  entityId: string;
  name: string;
  title: string;
  type: PropertyType;
  subtype: string | null;
  order: number;
  isDefault: boolean;
  isRequired: boolean;
  isHidden: boolean;
  isDisplay: boolean;
  isReadOnly: boolean;
  canUpdate: boolean;
  showInCreate: boolean;
  formulaId: string | null;
  tenantId: string | null;
}) {
  if (data.name.includes(" ")) {
    throw Error("Property names cannot contain spaces: " + data.name);
  }
  if (data.name.includes("-")) {
    throw Error("Property names cannot contain '-': " + data.name);
  }
  return await db.property.create({
    data,
  });
}

export type CreatePropertyDto = {
  name: string;
  title: string;
  type: PropertyType;
  subtype: string | null;
  isRequired?: boolean;
  isDefault?: boolean;
  isHidden?: boolean;
  isDisplay?: boolean;
  isReadOnly?: boolean;
  canUpdate?: boolean;
  showInCreate?: boolean;
  formulaId?: string | null;
  tenantId?: string | null;
  options?: { order: number; value: string; name?: string; color?: Colors }[];
  attributes?: {
    name: string;
    value: string;
  }[];
};
export async function createProperties(entityId: string, fields: CreatePropertyDto[]) {
  return await Promise.all(
    fields.map(async (field, idx) => {
      const property = await createProperty({
        entityId,
        order: defaultProperties.length + idx + 1,
        name: field.name,
        title: field.title,
        type: field.type,
        subtype: field.subtype ?? null,
        isRequired: field.isRequired ?? true,
        isDefault: field.isDefault ?? false,
        isHidden: field.isHidden ?? false,
        isDisplay: field.isDisplay ?? false,
        isReadOnly: field.isReadOnly ?? false,
        canUpdate: field.canUpdate ?? true,
        showInCreate: field.showInCreate ?? true,
        formulaId: field.formulaId ?? null,
        tenantId: field.tenantId ?? null,
      });

      if (field.options) {
        await updatePropertyOptions(
          property.id,
          field.options.map((option) => {
            return {
              order: option.order,
              value: option.value,
              name: option.name ?? null,
              color: option.color,
            };
          })
        );
      }
      if (field.attributes) {
        await updatePropertyAttributes(property.id, field.attributes);
      }
      return property;
    })
  );
}

export async function updateProperty(
  id: string,
  data: {
    name?: string;
    title?: string;
    type?: PropertyType;
    subtype?: string | null;
    order?: number;
    isDefault?: boolean;
    isRequired?: boolean;
    isHidden?: boolean;
    isDisplay?: boolean;
    isReadOnly?: boolean;
    canUpdate?: boolean;
    showInCreate?: boolean;
    formulaId?: string | null;
  }
) {
  const property = await db.property.update({
    where: { id },
    data,
  });

  return property;
}

export async function updatePropertyOrder(id: string, order: number) {
  return await db.property.update({
    where: { id },
    data: {
      order,
    },
  });
}

export async function updatePropertyOptions(id: string, options: { order: number; value: string; name?: string | null; color?: Colors }[]) {
  await db.propertyOption.deleteMany({
    where: { propertyId: id },
  });
  await Promise.all(
    options.map(async (option) => {
      return await db.propertyOption.create({
        data: {
          propertyId: id,
          order: option.order,
          value: option.value,
          name: option.name ?? null,
          color: option.color,
        },
      });
    })
  );
}

export async function updatePropertyAttributes(id: string, attributes: { name: string; value: string }[]) {
  await db.propertyAttribute.deleteMany({
    where: { propertyId: id },
  });
  await Promise.all(
    attributes
      .filter((f) => f.value !== undefined)
      .map(async (attribute) => {
        return await db.propertyAttribute.create({
          data: {
            propertyId: id,
            name: attribute.name,
            value: attribute.value,
          },
        });
      })
  );
}

export async function deleteProperty(id: string) {
  return await db.property.delete({
    where: { id },
  });
}
