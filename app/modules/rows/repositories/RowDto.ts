import { Row } from "@prisma/client";
import { RowValueWithDetails, RowWithDetails } from "~/utils/db/entities/rows.db.server";

export type RowDto = (
  | (Row & {
      values: RowValueWithDetails[];
    })
  | RowWithDetails
) & {
  metadata?: { [key: string]: any } | null;
};
