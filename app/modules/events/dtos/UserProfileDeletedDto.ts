import { AccountDeletedDto } from "./AccountDeletedDto";

export type UserProfileDeletedDto = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  deletedAccounts?: AccountDeletedDto[];
};
