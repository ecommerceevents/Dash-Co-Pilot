import { ApiKeyEntityPermissionDto } from "~/application/dtos/apiKeys/ApiKeyEntityPermissionDto";

export type ApiKeyDeletedDto = {
  id: string;
  alias: string;
  expires: Date | null;
  active: boolean;
  entities: ApiKeyEntityPermissionDto[];
  user: {
    id: string;
    email: string;
  };
};
