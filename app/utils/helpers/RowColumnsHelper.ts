import { Property } from "@prisma/client";
import { EntityWithDetails } from "../db/entities/entities.db.server";
import { defaultDisplayProperties } from "./PropertyHelper";

function isPropertyVisible(property: Property) {
  return !["id"].includes(property.name);
}

function getDefaultEntityColumns(entity: EntityWithDetails) {
  let properties: { name: string; title: string; visible: boolean }[] = [];

  // first default properties
  properties = [
    ...properties,
    ...defaultDisplayProperties
      .filter((f) => f.position === "before")
      .map((p) => {
        return { name: p.name, title: p.title, visible: p.displayedByDefault };
      }),
  ];

  // properties
  const entityProperties = entity.properties
    .filter((f) => !f.isDefault)
    .map((i) => {
      return { name: i.name, title: i.title, visible: true };
    });
  if (entityProperties.length > 0) {
    properties = [...properties, ...entityProperties];
  }

  // parents
  const parents = entity.parentEntities
    .filter((f) => !f.hiddenIfEmpty)
    .map((i) => {
      return { name: "parent." + i.parent.name, title: i.parent.titlePlural, visible: true };
    });
  if (parents.length > 0) {
    properties = [...properties, ...parents];
  }

  // children
  const children = entity.childEntities
    .filter((f) => !f.hiddenIfEmpty)
    .map((i) => {
      return { name: "child." + i.child.name, title: i.child.titlePlural, visible: true };
    });
  if (children.length > 0) {
    properties = [...properties, ...children];
  }

  const hiddenParents = entity.parentEntities.filter((f) => f.hiddenIfEmpty);
  if (hiddenParents.length > 0) {
    properties = [...properties, { name: "default.hiddenParents", title: "", visible: true }];
  }

  const hiddenChildren = entity.childEntities.filter((f) => f.hiddenIfEmpty);
  if (hiddenChildren.length > 0) {
    properties = [...properties, { name: "default.hiddenChildren", title: "", visible: true }];
  }

  // last default properties
  properties = [
    ...properties,
    ...defaultDisplayProperties
      .filter((f) => f.position === "after")
      .map((p) => {
        return { name: p.name, title: p.title, visible: p.displayedByDefault };
      }),
  ];

  return properties;
}

export default {
  isPropertyVisible,
  getDefaultEntityColumns,
};
