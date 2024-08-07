import { UserWithoutPassword } from "~/utils/db/users.db.server";

export type ImpersonatingSessionDto = {
  fromUser: UserWithoutPassword;
  toUser: UserWithoutPassword;
};
