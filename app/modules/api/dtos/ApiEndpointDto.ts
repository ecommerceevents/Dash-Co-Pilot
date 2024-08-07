import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";

export type ApiEndpointDto = {
  entity: EntityWithDetails;
  route: string;
  method: string;
  description: string;
  responseSchema: string;
  bodyExample: string;
};
