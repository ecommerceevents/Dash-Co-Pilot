import { EntitiesApi } from "~/utils/api/.server/EntitiesApi";
import { RowsApi } from "~/utils/api/.server/RowsApi";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import { BlockVariableDto } from "../../../shared/variables/BlockVariableDto";

export type RowsNewBlockDto = {
  style: RowsNewBlockStyle;
  hiddenProperties: string[];
  variables: {
    entityName: BlockVariableDto;
    tenantId: BlockVariableDto;
    redirectTo: BlockVariableDto;
  };
  data: {
    entityData: EntitiesApi.GetEntityData;
    allEntities: EntityWithDetails[];
    relationshipRows: RowsApi.GetRelationshipRowsData;
  } | null;
};

export type RowsNewBlockData = RowsNewBlockDto["data"];

export const RowsNewBlockStyles = [{ value: "form", name: "Form" }] as const;
export type RowsNewBlockStyle = (typeof RowsNewBlockStyles)[number]["value"];

export const defaultRowsNewBlock: RowsNewBlockDto = {
  style: "form",
  hiddenProperties: [],
  variables: {
    entityName: { type: "manual", value: "contact", required: true },
    tenantId: { type: "manual", value: null },
    redirectTo: { type: "manual", value: "/:id" },
  },
  data: null,
};
