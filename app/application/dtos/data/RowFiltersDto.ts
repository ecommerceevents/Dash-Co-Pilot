import { Entity, Property } from "@prisma/client";
import { EntityRelationshipWithDetails } from "~/utils/db/entities/entityRelationships.db.server";

export interface RowFiltersDto {
  customRow: boolean;
  entity: Entity;
  query: string | null;
  properties: {
    property?: Property;
    name?: string;
    value: string | string[] | null;
    condition?: string;
    match?: "and" | "or";
    parentEntity?: EntityRelationshipWithDetails;
  }[];
  tags: string[];
}
