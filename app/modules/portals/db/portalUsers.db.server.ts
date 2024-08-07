import { db } from "~/utils/db.server";
import { PortalUserDto } from "../dtos/PortalUserDto";
import { cachified, clearCacheKey } from "~/utils/cache.server";

export async function getPortalUserById(portalId: string, id: string): Promise<PortalUserDto | null> {
  return await cachified({
    key: `portalUser:${portalId}:${id}`,
    ttl: 60 * 60 * 24,
    getFreshValue: async () => {
      return db.portalUser.findUnique({
        where: {
          portalId,
          id,
        },
        select: {
          id: true,
          portalId: true,
          createdAt: true,
          email: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      });
    },
  });
}

export async function getPortalUserByEmail(portalId: string, email: string): Promise<PortalUserDto | null> {
  return await cachified({
    key: `portalUserByEmail:${portalId}:${email}`,
    ttl: 60 * 60 * 24,
    getFreshValue: async () => {
      return db.portalUser.findUnique({
        where: {
          portalId_email: {
            portalId,
            email,
          },
        },
        select: {
          id: true,
          portalId: true,
          createdAt: true,
          email: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      });
    },
  });
}

export async function getPortalUsers(portalId: string): Promise<PortalUserDto[]> {
  return await db.portalUser.findMany({
    where: {
      portalId,
    },
    select: {
      id: true,
      createdAt: true,
      portalId: true,
      email: true,
      firstName: true,
      lastName: true,
      avatar: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function createPortalUser(data: {
  tenantId: string | null;
  portalId: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
}) {
  return await db.portalUser.create({
    data: {
      tenantId: data.tenantId,
      portalId: data.portalId,
      email: data.email,
      passwordHash: data.passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      avatar: data.avatar,
    },
  });
}

export async function updatePortalUser(
  id: string,
  data: {
    email?: string;
    passwordHash?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string | null;
  }
) {
  return await db.portalUser
    .update({
      where: {
        id,
      },
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        avatar: data.avatar,
      },
    })
    .then((item) => {
      clearCacheKey(`portalUser:${item.portalId}:${id}`);
      clearCacheKey(`portalUserByEmail:${item.portalId}:${item.email}`);
      return item;
    });
}

export async function deletePortalUser(portalId: string, id: string) {
  return await db.portalUser.delete({
    where: {
      portalId,
      id,
    },
  });
}

export async function countPortalUsersByTenantId(tenantId: string | null): Promise<number> {
  return await db.portalUser.count({
    where: {
      tenantId,
    },
  });
}

export async function getPortalUserPasswordHash(id: string): Promise<string | null> {
  const user = await db.portalUser.findUnique({
    where: {
      id,
    },
    select: {
      passwordHash: true,
    },
  });
  return user?.passwordHash ?? null;
}

export async function updatePortalUserPassword(id: string, data: { passwordHash: string }) {
  return await db.portalUser.update({
    where: { id },
    data: {
      passwordHash: data.passwordHash,
    },
  });
}
