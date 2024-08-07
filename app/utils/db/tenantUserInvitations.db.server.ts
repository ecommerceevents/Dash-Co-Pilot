import { TenantUserType } from "~/application/enums/tenants/TenantUserType";
import { db } from "~/utils/db.server";

export async function getUserInvitation(id: string) {
  return await db.tenantUserInvitation.findFirst({
    where: {
      id,
      pending: true,
    },
    include: {
      tenant: true,
    },
  });
}

export async function getUserInvitations(tenantId?: string) {
  if (!tenantId) {
    return [];
  }
  return await db.tenantUserInvitation.findMany({
    where: {
      tenantId,
      pending: true,
    },
  });
}

export async function createUserInvitation(
  tenantId: string,
  data: {
    email: string;
    firstName: string;
    lastName: string;
    type: TenantUserType;
    fromUserId: string | null;
  }
) {
  const invitation = await db.tenantUserInvitation.create({
    data: {
      tenantId,
      ...data,
      pending: true,
    },
  });

  return invitation;
}

export async function updateUserInvitationPending(id: string) {
  return await db.tenantUserInvitation.update({
    where: {
      id,
    },
    data: {
      pending: false,
    },
  });
}

export async function deleteUserInvitation(id: string) {
  return await db.tenantUserInvitation.delete({
    where: {
      id,
    },
  });
}
