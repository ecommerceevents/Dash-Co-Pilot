import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";

export type PromptFlowOutputResultDto = {
  createdRows: {
    entity: EntityWithDetails;
    row: RowWithDetails;
    href: string;
  }[];
  updatedRows: {
    entity: EntityWithDetails;
    row: RowWithDetails;
    href: string;
  }[];
};
