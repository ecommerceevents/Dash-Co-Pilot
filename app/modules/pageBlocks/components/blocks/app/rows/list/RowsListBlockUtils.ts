import { RowsApi } from "~/utils/api/.server/RowsApi";
import { BlockVariableDto } from "../../../shared/variables/BlockVariableDto";

export type RowsListBlockDto = {
  style: RowsListBlockStyle;
  variables: {
    entityName: BlockVariableDto;
    tenantId: BlockVariableDto;
    pageSize: BlockVariableDto;
  };
  data: RowsApi.GetRowsData | null;
};

export type RowsListBlockData = RowsListBlockDto["data"];

export const RowsListBlockStyles = [{ value: "table", name: "Table" }] as const;
export type RowsListBlockStyle = (typeof RowsListBlockStyles)[number]["value"];

export const defaultRowsListBlock: RowsListBlockDto = {
  style: "table",
  variables: {
    entityName: { type: "manual", value: "contact", required: true },
    tenantId: { type: "manual", value: null },
    pageSize: { type: "manual", value: "10" },
  },
  data: null,
};
