import { Entity, Property } from "@prisma/client";

export interface SortedByDto {
  name: string;
  direction: "asc" | "desc";
  property?: Property;
  entity?: Entity;
}
