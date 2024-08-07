import { Tenant, Role } from "@prisma/client";
import { getMyTenants, getTenantWithUsers } from "../db/tenants.db.server";
import { UserWithoutPassword, deleteUser } from "../db/users.db.server";
import { deleteAndCancelTenant } from "./tenantService";
import { db } from "../db.server";
import { createUserRoles, deleteAllUserRoles } from "../db/permissions/userRoles.db.server";
import { clearCacheKey } from "../cache.server";

export async function deleteUserWithItsTenants(id: string) {
  const userTenants = await getMyTenants(id);
  const deletedAccounts = await Promise.all(
    userTenants.map(async (userTenant) => {
      const tenantUsers = await getTenantWithUsers(userTenant.id);
      if (tenantUsers?.users.length === 1 && tenantUsers.users[0].userId === id) {
        return await deleteAndCancelTenant(userTenant.id);
      }
    })
  );
  const deletedTenants: Tenant[] = [];
  deletedAccounts.forEach((deletedAccount) => {
    if (deletedAccount) {
      deletedTenants.push(deletedAccount);
    }
  });
  return {
    deletedUser: await deleteUser(id),
    deletedTenants,
  };
}

export async function setUserRoles({
  user,
  roles,
  isAdmin,
  type,
}: {
  user: UserWithoutPassword;
  roles: { role: Role; tenantId: string | null }[];
  isAdmin: boolean;
  type: "admin" | "app";
}) {
  if (user.admin && !isAdmin) {
    await db.adminUser.delete({ where: { userId: user.id } });
  } else if (!user.admin && isAdmin) {
    await db.adminUser.create({ data: { userId: user.id } });
  }

  await deleteAllUserRoles(user.id, type);
  return await createUserRoles(
    user.id,
    roles.map(({ role, tenantId }) => ({
      id: role.id,
      tenantId,
    }))
  ).then((item) => {
    clearCacheKey(`user:${user.id}`);
    clearCacheKey(`userRoles:${user.id}:${null}`);
    return item;
  });
}
