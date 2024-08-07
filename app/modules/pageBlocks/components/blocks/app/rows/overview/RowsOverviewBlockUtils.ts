import { RowsApi } from "~/utils/api/.server/RowsApi";
import { BlockVariableDto } from "../../../shared/variables/BlockVariableDto";

export type RowsOverviewBlockDto = {
  style: RowsOverviewBlockStyle;
  hiddenProperties: string[];
  variables: {
    entityName: BlockVariableDto;
    tenantId: BlockVariableDto;
    rowId: BlockVariableDto;
  };
  data: {
    rowData: RowsApi.GetRowData;
    relationshipRows: RowsApi.GetRelationshipRowsData;
  } | null;
};

export type RowsOverviewBlockData = RowsOverviewBlockDto["data"];

export const RowsOverviewBlockStyles = [{ value: "form", name: "Form" }] as const;
export type RowsOverviewBlockStyle = (typeof RowsOverviewBlockStyles)[number]["value"];

export const defaultRowsOverviewBlock: RowsOverviewBlockDto = {
  style: "form",
  hiddenProperties: [],
  variables: {
    entityName: { type: "manual", value: "contact", required: true },
    tenantId: { type: "manual", value: null },
    rowId: { type: "param", param: "id1", required: true },
  },
  data: null,
};
