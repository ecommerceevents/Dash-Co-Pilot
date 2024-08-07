import { createProperty, updatePropertyAttributes, updatePropertyOptions } from "../../db/entities/properties.db.server";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import { Colors } from "~/application/enums/shared/Colors";
import { EntityWithDetails } from "../../db/entities/entities.db.server";

export namespace PropertiesApi {
  export async function create({
    entityId,
    name,
    title,
    type,
    subtype,
    order,
    isDefault,
    isRequired,
    isHidden,
    isDisplay,
    isReadOnly,
    canUpdate,
    showInCreate,
    formulaId,
    options,
    attributes,
    tenantId,
  }: {
    entityId: string;
    name: string;
    title: string;
    type: PropertyType;
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
    options?: { order: number; value: string; name?: string | null; color?: Colors }[];
    attributes?: { name: string; value: string }[];
    tenantId: string | null;
  }) {
    if (!order) {
      order = 0;
    }
    const property = await createProperty({
      entityId,
      name,
      title,
      type,
      subtype: subtype ?? null,
      order,
      isDefault: isDefault ?? false,
      isRequired: isRequired ?? false,
      isHidden: isHidden ?? false,
      isDisplay: isDisplay ?? false,
      isReadOnly: isReadOnly ?? false,
      canUpdate: canUpdate ?? true,
      showInCreate: showInCreate ?? true,
      formulaId: formulaId ?? null,
      tenantId,
    });
    if (options !== undefined) {
      await updatePropertyOptions(property.id, options);
    }
    if (attributes !== undefined) {
      await updatePropertyAttributes(property.id, attributes);
    }
    return property;
  }
  export async function duplicate({ entity, propertyId }: { entity: EntityWithDetails; propertyId: string }) {
    const existingProperty = entity.properties.find((p) => p.id === propertyId);
    if (!existingProperty) {
      throw Error("Property not found");
    }
    let number = 2;
    let name = "";

    const findExistingProperty = (name: string) => {
      return entity.properties.find((p) => p.name === name);
    };

    do {
      name = `${existingProperty.name}${number}`;
      const existingPropertyWithNewName = findExistingProperty(name);
      if (!existingPropertyWithNewName) {
        break;
      }
      if (number > 10) {
        throw Error("Too many duplicates");
      }
      number++;
    } while (true);

    let maxOrder = 0;
    if (entity.properties.length > 0) {
      maxOrder = Math.max(...entity.properties.map((p) => p.order));
    }

    return await create({
      entityId: entity.id,
      name,
      title: existingProperty.title + " " + number,
      type: existingProperty.type,
      subtype: existingProperty.subtype,
      order: maxOrder + 1,
      isDefault: existingProperty.isDefault,
      isRequired: existingProperty.isRequired,
      isHidden: existingProperty.isHidden,
      isDisplay: existingProperty.isDisplay,
      isReadOnly: existingProperty.isReadOnly,
      showInCreate: existingProperty.showInCreate,
      formulaId: existingProperty.formulaId,
      options: existingProperty.options.map((o) => ({
        order: o.order,
        value: o.value,
        name: o.name,
        color: o.color,
      })),
      attributes: existingProperty.attributes.map((a) => ({
        name: a.name,
        value: a.value,
      })),
      tenantId: existingProperty.tenantId,
    });
  }
}
