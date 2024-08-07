import { RowMedia, RowValueMultiple, RowValueRange } from "@prisma/client";
import { PropertyWithDetails } from "~/utils/db/entities/entities.db.server";

export type RowValueDto = {
  id?: string | null;
  property: PropertyWithDetails;
  propertyId: string;
  textValue?: string | undefined;
  numberValue?: number | undefined;
  dateValue?: Date | undefined;
  booleanValue?: boolean | undefined;
  selectedOption?: string | undefined;
  media?: RowMedia[];
  multiple?: RowValueMultiple[];
  range?: RowValueRange | undefined;
};
