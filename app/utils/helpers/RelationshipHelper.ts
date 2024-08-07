import { EntityRelationshipWithDetails } from "../db/entities/entityRelationships.db.server";

// function getTopEntities({ entity }: { entity: EntityWithDetails }) {
//   return [...entity.parentEntities.filter((f) => f.type !== "one-to-one")];
// }

// function getBottomEntities({ entity }: { entity: EntityWithDetails }) {
//   return [...entity.childEntities, ...entity.parentEntities.filter((f) => f.type === "one-to-one")];
// }

function getTitle({ fromEntityId, relationship }: { fromEntityId: string; relationship: EntityRelationshipWithDetails }) {
  if (relationship.title) {
    return relationship.title;
  }
  const isParent = relationship.parentId === fromEntityId;
  switch (relationship.type) {
    case "one-to-one":
      return isParent ? relationship.child.title : relationship.parent.title;
    case "one-to-many":
      return isParent ? relationship.child.titlePlural : relationship.parent.title;
    case "many-to-one":
      return isParent ? relationship.child.title : relationship.parent.titlePlural;
    case "many-to-many":
      return isParent ? relationship.child.titlePlural : relationship.parent.titlePlural;
    default:
      return isParent ? relationship.child.titlePlural : relationship.parent.title;
  }
}

function getTitleWithName({ fromEntityId, relationship }: { fromEntityId: string; relationship: EntityRelationshipWithDetails }) {
  if (relationship.title) {
    return relationship.title;
  }
  const isParent = relationship.parentId === fromEntityId;
  switch (relationship.type) {
    case "one-to-one":
      return isParent ? `${relationship.child.title} (1)` : `${relationship.parent.title} (1)${relationship.required ? "*" : ""}`;
    case "one-to-many":
      return isParent ? `${relationship.child.titlePlural} (N)` : `${relationship.parent.title} (1)${relationship.required ? "*" : ""}`;
    case "many-to-one":
      return isParent ? `${relationship.child.title} (1)${relationship.required ? "*" : ""}` : `${relationship.parent.titlePlural} (N)`;
    case "many-to-many":
      return isParent ? `${relationship.child.titlePlural} (N)` : `${relationship.parent.titlePlural} (N)${relationship.required ? "*" : ""}`;
    default:
      return isParent ? `${relationship.child.titlePlural} (N)` : `${relationship.parent.title} (1)${relationship.required ? "*" : ""}`;
  }
}

function getInputType({ fromEntityId, relationship }: { fromEntityId: string; relationship: EntityRelationshipWithDetails }): "single-select" | "multi-select" {
  const isParent = relationship.parentId === fromEntityId;
  switch (relationship.type) {
    case "one-to-one":
      return "single-select";
    case "one-to-many":
      return isParent ? "multi-select" : "single-select";
    case "many-to-one":
      return isParent ? "single-select" : "multi-select";
    case "many-to-many":
      return "multi-select";
    default:
      return isParent ? "multi-select" : "single-select";
  }
}

export default {
  // getTopEntities,
  // getBottomEntities,
  getTitle,
  getTitleWithName,
  getInputType,
};
