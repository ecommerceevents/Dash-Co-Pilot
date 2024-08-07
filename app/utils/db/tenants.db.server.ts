import { Prisma, Role, Tenant, TenantInboundAddress, TenantSettingsRow, TenantType, TenantUser } from "@prisma/client";
import { FiltersDto } from "~/application/dtos/data/FiltersDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { TenantUserJoined } from "~/application/enums/tenants/TenantUserJoined";
import { TenantUserStatus } from "~/application/enums/tenants/TenantUserStatus";
import { db } from "~/utils/db.server";
import UserModelHelper from "~/utils/helpers/models/UserModelHelper";
import RowFiltersHelper from "../helpers/RowFiltersHelper";
import { getAvailableTenantInboundAddress } from "../services/emailService";
import { createUserRole } from "./permissions/userRoles.db.server";
import { TenantSubscriptionWithDetails, createTenantSubscription } from "./tenantSubscriptions.db.server";
import { UserSimple, UserWithRoles } from "./users.db.server";
import { RowWithDetails } from "./entities/rows.db.server";
import { getAvailableTenantSlug } from "../services/tenantService";
import RowModelHelper from "../helpers/models/RowModelHelper";
import TenantModelHelper from "../helpers/models/TenantModelHelper";
import TenantSubscriptionProductModelHelper from "../helpers/models/TenantSubscriptionProductModelHelper";
import { cachified, clearCacheKey } from "../cache.server";

export type TenantSimple = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  deactivatedReason: string | null;
  types: TenantType[];
  active: boolean;
};

export type TenantWithDetails = Tenant & {
  inboundAddresses: TenantInboundAddress[];
  users: (TenantUser & {
    user: UserSimple;
  })[];
  subscription: TenantSubscriptionWithDetails | null;
  tenantSettingsRow: (TenantSettingsRow & { row: RowWithDetails }) | null;
  types: TenantType[];
};

export type TenantWithUsage = TenantWithDetails & {
  _count: {
    users?: number;
    invitations?: number;
    rows?: number;
    logs?: number;
    apiKeys?: number;
    createdLinkedAccounts?: number;
    asProviderLinkedAccounts?: number;
    asClientLinkedAccounts?: number;
    events?: number;
  };
};

export type TenantUserWithUser = TenantUser & {
  user: UserWithRoles;
};

export type TenantUserWithDetails = TenantUser & {
  tenant: Tenant;
  user: UserSimple;
};

export async function getTenantsInIds(ids: string[]): Promise<TenantWithDetails[]> {
  return await db.tenant.findMany({
    where: { id: { in: ids } },
    include: {
      ...TenantModelHelper.includeTenantWithDetails,
    },
  });
}

export async function adminGetAllTenants(): Promise<TenantWithDetails[]> {
  return await db.tenant.findMany({
    include: {
      ...TenantModelHelper.includeTenantWithDetails,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function adminGetAllTenantsIdsAndNames(): Promise<{ id: string; name: string; slug: string }[]> {
  return await db.tenant.findMany({
    select: { id: true, name: true, slug: true },
  });
}

export async function adminGetAllTenantsWithUsage(
  filters?: FiltersDto,
  pagination?: { page: number; pageSize: number }
): Promise<{ items: TenantWithUsage[]; pagination: PaginationDto }> {
  let where: Prisma.TenantWhereInput = RowFiltersHelper.getFiltersCondition(filters);
  const userId = filters?.properties.find((f) => f.name === "userId")?.value ?? filters?.query ?? "";
  if (userId) {
    if (where) {
      where = {
        OR: [where, { users: { some: { userId } } }],
      };
    } else {
      where = { users: { some: { userId } } };
    }
  }
  const typeId = filters?.properties.find((f) => f.name === "typeId")?.value;
  if (typeId) {
    if (where) {
      if (typeId === "null") {
        where = {
          OR: [where, { types: { none: {} } }],
        };
      } else {
        where = {
          OR: [where, { types: { some: { id: typeId } } }],
        };
      }
    } else {
      if (typeId === "null") {
        where = { types: { none: {} } };
      } else {
        where = { types: { some: { id: typeId } } };
      }
    }
  }
  const items = await db.tenant.findMany({
    skip: pagination ? pagination?.pageSize * (pagination?.page - 1) : undefined,
    take: pagination ? pagination?.pageSize : undefined,
    where,
    include: {
      inboundAddresses: true,
      users: {
        include: {
          ...UserModelHelper.includeSimpleUser,
        },
      },
      subscription: {
        include: {
          products: { include: { ...TenantSubscriptionProductModelHelper.includeTenantSubscriptionProductDetails } },
        },
      },
      tenantSettingsRow: { include: { row: { include: RowModelHelper.includeRowDetails } } },
      types: true,
      _count: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  const totalItems = await db.tenant.count({
    where,
  });
  return {
    items,
    pagination: {
      page: pagination?.page ?? 1,
      pageSize: pagination?.pageSize ?? 10,
      totalItems,
      totalPages: Math.ceil(totalItems / (pagination?.pageSize ?? 10)),
    },
  };
}

export async function getTenant(id: string): Promise<TenantWithDetails | null> {
  return await cachified({
    key: `tenant:${id}`,
    ttl: 1000 * 60 * 60 * 24,
    getFreshValue: () =>
      db.tenant.findUnique({
        where: {
          id,
        },
        include: {
          ...TenantModelHelper.includeTenantWithDetails,
        },
      }),
  });
}

export async function getTenantSimple(id: string): Promise<TenantSimple | null> {
  return await cachified({
    key: `tenantSimple:${id}`,
    ttl: 1000 * 60 * 60 * 24,
    getFreshValue: () =>
      db.tenant.findUnique({
        where: { id },
        select: TenantModelHelper.selectSimpleTenantProperties,
      }),
  });
}

export async function getTenantByIdOrSlug(id: string) {
  return await cachified({
    key: `tenantIdOrSlug:${id}`,
    ttl: 1000 * 60 * 60 * 24,
    getFreshValue: () =>
      db.tenant.findFirst({
        where: {
          OR: [{ id }, { slug: id }],
        },
        include: {
          subscription: true,
        },
      }),
  });
}

export async function getTenantBySlug(slug: string) {
  return await db.tenant.findUnique({
    where: {
      slug,
    },
  });
}

export async function getTenantWithUsers(id?: string) {
  if (!id) {
    return null;
  }
  return await db.tenant.findUnique({
    where: {
      id,
    },
    include: {
      users: true,
    },
  });
}

export async function getMyTenants(userId: string): Promise<TenantSimple[]> {
  const tenantsAsMember = await db.tenant.findMany({
    where: { users: { some: { userId } } },
    select: TenantModelHelper.selectSimpleTenantProperties,
    orderBy: { name: "asc" },
  });

  // await Promise.all(tenantsAsMember.map(async(tenant) => {
  //   const relatedTenants = await db.tenantRelationship.findFirst({
  //     where: { fromTenantId: tenant.id },
  //     include: { toTenant: true },
  //   });
  // }));

  return [...tenantsAsMember];
}

export async function getTenantUsersCount(tenantId: string) {
  return await db.tenantUser.count({
    where: { tenantId },
  });
}

export async function getTenantUsers(tenantId?: string | null): Promise<TenantUserWithUser[]> {
  if (!tenantId) {
    return [];
  }
  return await db.tenantUser.findMany({
    where: {
      tenantId,
    },
    include: {
      user: {
        include: {
          admin: true,
          roles: { include: { role: true } },
        },
      },
    },
  });
}

export async function getTenantUsersInTenantIds(tenantIds: string[]): Promise<TenantUserWithDetails[]> {
  return await db.tenantUser.findMany({
    where: {
      tenantId: { in: tenantIds },
    },
    include: {
      tenant: true,
      user: { select: UserModelHelper.selectSimpleUserProperties },
    },
  });
}

export async function getAllTenantUsers(): Promise<TenantUserWithUser[]> {
  return await db.tenantUser.findMany({
    include: {
      user: {
        include: {
          admin: true,
          roles: { include: { role: true } },
        },
      },
    },
  });
}

export async function getTenantUser(id?: string) {
  if (!id) {
    return null;
  }
  return await db.tenantUser.findUnique({
    where: {
      id,
    },
    include: {
      tenant: true,
      user: true,
    },
  });
}

export async function getTenantUserByIds(tenantId: string, userId: string) {
  return await db.tenantUser.findFirst({
    where: {
      tenantId,
      userId,
    },
    include: {
      tenant: true,
      user: true,
    },
  });
}

export async function getTenantMember(userId?: string, tenantId?: string) {
  return await db.tenantUser.findFirst({
    where: {
      userId,
      tenantId,
    },
    include: {
      tenant: true,
      user: true,
    },
  });
}

export async function getTenantUserType(userId: string, tenantId: string) {
  return await db.tenantUser.findFirst({
    where: {
      userId,
      tenantId,
    },
    select: { type: true },
  });
}

export async function updateTenant(before: Tenant, data: { name?: string; icon?: string; slug?: string; typeIds?: string[] }) {
  const update: Prisma.TenantUncheckedUpdateInput = {
    name: data.name,
    icon: data.icon,
    slug: data.slug,
  };
  if (data.typeIds) {
    update.types = { set: data.typeIds.map((type) => ({ id: type })) };
  }
  return await db.tenant
    .update({
      where: {
        id: before.id,
      },
      data: update,
    })
    .then((item) => {
      clearCacheKey(`tenant:${before.slug}`);
      clearCacheKey(`tenant:${before.id}`);
      clearCacheKey(`tenantIdOrSlug:${before.id}`);
      clearCacheKey(`tenantIdOrSlug:${before.slug}`);
      clearCacheKey(`tenantSimple:${before.id}`);
      return item;
    });
}

export async function addTenantTypeToTenant(id: string, data: { typeId: string }) {
  return await db.tenant
    .update({
      where: { id },
      data: { types: { connect: { id: data.typeId } } },
    })
    .then((item) => {
      clearCacheKey(`tenant:${item.slug}`);
      clearCacheKey(`tenant:${item.id}`);
      clearCacheKey(`tenantSimple:${item.id}`);
      return item;
    });
}

export async function updateTenantUser(id: string, data: { type: number }) {
  return await db.tenantUser.update({
    where: {
      id,
    },
    data,
  });
}

export async function createTenant({
  name,
  icon,
  subscriptionCustomerId,
  active,
  slug,
}: {
  name: string;
  icon?: string;
  subscriptionCustomerId?: string | undefined;
  active?: boolean;
  slug?: string;
}) {
  slug = await getAvailableTenantSlug({ name, slug });
  const inboundAddress = await getAvailableTenantInboundAddress(name);
  const tenant = await db.tenant.create({
    data: {
      name,
      slug,
      icon,
      active,
      inboundAddresses: {
        create: [{ address: inboundAddress }],
      },
    },
  });

  if (subscriptionCustomerId) {
    await createTenantSubscription(tenant.id, subscriptionCustomerId);
  }

  return tenant;
}

export async function createTenantUser(data: { tenantId: string; userId: string; type: number }, roles: Role[]) {
  const tenantUser = await db.tenantUser.create({
    data: {
      ...data,
      joined: TenantUserJoined.JOINED_BY_INVITATION,
      status: TenantUserStatus.ACTIVE,
    },
  });

  await Promise.all(
    roles.map(async (role) => {
      return await createUserRole(tenantUser.userId, role.id, tenantUser.tenantId);
    })
  );

  return tenantUser;
}

export async function deleteTenantUser(id: string) {
  return await db.tenantUser.delete({
    where: {
      id,
    },
  });
}

export async function deleteTenant(id: string) {
  return await db.tenant.delete({
    where: {
      id,
    },
    include: {
      subscription: true,
      users: true,
      invitations: true,
      rows: true,
      logs: true,
      apiKeys: true,
      createdLinkedAccounts: true,
      asProviderLinkedAccounts: true,
      asClientLinkedAccounts: true,
      userRoles: true,
    },
  });
}

export async function updateTenantDeactivated(id: string, data: { active: boolean; deactivatedReason: string | null }) {
  return await db.tenant
    .update({
      where: {
        id,
      },
      data,
    })
    .then((item) => {
      clearCacheKey(`tenant:${item.slug}`);
      clearCacheKey(`tenant:${item.id}`);
      clearCacheKey(`tenantIdOrSlug:${item.id}`);
      clearCacheKey(`tenantIdOrSlug:${item.slug}`);
      clearCacheKey(`tenantSimple:${item.id}`);
      return item;
    });
}

export async function getAllTenantsWithoutTypes() {
  return await db.tenant.findMany({
    where: { types: { none: {} } },
  });
}
