import { AdminUser, Role, Tenant, TenantUser, UserRole } from ".prisma/client";
import bcrypt from "bcryptjs";
import Constants from "~/application/Constants";
import { FiltersDto } from "~/application/dtos/data/FiltersDto";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { db } from "~/utils/db.server";
import RowFiltersHelper from "../helpers/RowFiltersHelper";
import { SortedByDto } from "~/application/dtos/data/SortedByDto";
import { Prisma } from "@prisma/client";
import DateUtils from "../shared/DateUtils";
import { DefaultLogActions } from "~/application/dtos/shared/DefaultLogActions";
import { cachified, clearCacheKey } from "../cache.server";
import CrmService from "~/modules/crm/services/CrmService";
import { ContactStatus } from "~/application/dtos/crm/ContactStatus";

export type UserSimple = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  // avatar: string | null;
  phone: string | null;
  githubId: string | null;
  googleId: string | null;
  locale: string | null;
  createdAt: Date;
};
export type UserWithNames = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};
export type UserWithoutPassword = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  phone: string | null;
  admin?: AdminUser | null;
  defaultTenantId: string | null;
  createdAt: Date;
  githubId: string | null;
  googleId: string | null;
  locale: string | null;
};
export type UserWithRoles = UserSimple & {
  admin?: AdminUser | null;
  roles: (UserRole & { role: Role })[];
};

export type UserWithDetails = UserWithoutPassword & {
  admin: AdminUser | null;
  tenants: (TenantUser & { tenant: Tenant })[];
  roles: (UserRole & { role: Role })[];
};

export const includeCreatedBy = {
  byUser: {
    select: { id: true, email: true, firstName: true, lastName: true },
  },
  byApiKey: {
    select: { id: true, alias: true },
  },
  byEmail: {
    select: { id: true, subject: true },
  },
  byEventWebhookAttempt: {
    select: { id: true, endpoint: true, message: true },
  },
};

export async function adminGetAllTenantUsers(tenantId: string): Promise<UserWithDetails[]> {
  return db.user.findMany({
    where: {
      tenants: {
        some: {
          tenantId,
        },
      },
    },
    include: {
      admin: true,
      tenants: {
        include: {
          tenant: true,
        },
      },
      roles: {
        include: {
          role: true,
        },
      },
    },
  });
}

export async function adminGetAllUsers(
  filters?: FiltersDto,
  pagination?: { page: number; pageSize: number; sortedBy?: SortedByDto[] }
): Promise<{ items: UserWithDetails[]; pagination: PaginationDto }> {
  let where: Prisma.UserWhereInput = RowFiltersHelper.getFiltersCondition(filters);
  const tenantId = filters?.properties.find((f) => f.name === "tenantId")?.value ?? filters?.query ?? "";
  if (tenantId) {
    where = {
      OR: [where, { tenants: { some: { tenantId } } }],
    };
  }
  // lastLogin manual filter
  const lastLoginFilter = filters?.properties.find((f) => f.name === "lastLogin");
  if (lastLoginFilter?.value) {
    const gte = DateUtils.gteFromFilter(lastLoginFilter.value);
    const logs = (
      await db.log.findMany({
        where: { userId: { not: null }, createdAt: { gte }, action: DefaultLogActions.Login },
        select: { userId: true },
      })
    ).map((l) => l.userId);
    const usersIn: string[] = logs.filter((f) => f !== null).map((m) => m as string);
    where = {
      AND: [where, { id: { in: usersIn } }],
    };
  }

  const isAdminFilter = filters?.properties.find((f) => f.name === "isAdmin");
  if (isAdminFilter?.value) {
    if (isAdminFilter.value === "true") {
      where = {
        AND: [where, { admin: { isNot: null } }],
      };
    } else {
      where = {
        AND: [where, { admin: null }],
      };
    }
  }

  let orderBy: Prisma.UserOrderByWithRelationInput[] = [{ createdAt: "desc" }];
  if (pagination?.sortedBy?.length) {
    pagination.sortedBy = pagination.sortedBy.filter((s) => ["email", "firstName", "lastName", "createdAt"].includes(s.name));
    orderBy = pagination.sortedBy.map((s) => {
      return { [s.name]: s.direction };
    });
  }
  const items = await db.user.findMany({
    skip: pagination ? pagination?.pageSize * (pagination?.page - 1) : undefined,
    take: pagination ? pagination?.pageSize : undefined,
    where,
    include: {
      admin: true,
      tenants: {
        include: {
          tenant: true,
        },
      },
      roles: {
        include: {
          role: true,
        },
      },
    },
    orderBy,
  });
  const totalItems = await db.user.count({
    where,
  });
  return {
    items,
    pagination: {
      page: pagination?.page ?? 1,
      pageSize: pagination?.pageSize ?? Constants.DEFAULT_PAGE_SIZE,
      totalItems,
      totalPages: Math.ceil(totalItems / (pagination?.pageSize ?? Constants.DEFAULT_PAGE_SIZE)),
    },
  };
}

export async function adminGetAllUsersNames(): Promise<UserWithNames[]> {
  return db.user.findMany({
    select: { id: true, email: true, firstName: true, lastName: true },
  });
}

export async function adminGetAllUsersNamesInIds(ids: string[]): Promise<UserWithNames[]> {
  return db.user.findMany({
    select: { id: true, email: true, firstName: true, lastName: true },
    where: {
      id: { in: ids },
    },
  });
}

export async function getUsersById(ids: string[]): Promise<UserWithDetails[]> {
  return db.user.findMany({
    where: {
      id: {
        in: ids,
      },
    },
    include: {
      admin: true,
      tenants: {
        include: {
          tenant: true,
        },
      },
      roles: {
        include: {
          role: true,
        },
      },
    },
  });
}

export async function getAdminUsersInRoles(roles: string[]): Promise<UserWithDetails[]> {
  return db.user.findMany({
    where: { roles: { some: { role: { id: { in: roles } } } } },
    include: {
      admin: true,
      tenants: {
        include: {
          tenant: true,
        },
      },
      roles: {
        include: {
          role: true,
        },
      },
    },
  });
}

export async function getUsersByTenant(tenantId: string | null): Promise<UserWithDetails[]> {
  let where = {};
  if (tenantId) {
    where = {
      tenants: {
        some: {
          tenantId,
        },
      },
    };
  } else {
    where = {
      admin: {
        isNot: null,
      },
    };
  }
  return db.user.findMany({
    where,
    include: {
      admin: true,
      tenants: {
        include: {
          tenant: true,
        },
      },
      roles: {
        include: {
          role: true,
        },
      },
    },
  });
}

export async function getUser(userId?: string): Promise<UserWithoutPassword | null> {
  if (!userId) {
    return null;
  }
  try {
    return await cachified({
      key: `user:${userId}`,
      ttl: 1000 * 60 * 60 * 24,
      getFreshValue: async () =>
        db.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            phone: true,
            admin: true,
            defaultTenantId: true,
            createdAt: true,
            githubId: true,
            googleId: true,
            locale: true,
          },
        }),
    });
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.log(error.message);
    return null;
  }
}

export async function getUserByEmail(email?: string) {
  if (!email) {
    return null;
  }
  return await db.user.findUnique({
    where: { email },
    include: {
      tenants: true,
      admin: true,
    },
  });
}

export async function getUserByEmailWithDetails(email: string): Promise<UserWithDetails | null> {
  return await db.user.findUnique({
    where: { email },
    include: {
      admin: true,
      tenants: { include: { tenant: true } },
      roles: { include: { role: true } },
    },
  });
}

export async function getUserByGoogleID(googleId: string) {
  return await db.user.findUnique({
    where: { googleId },
    include: {
      tenants: true,
      admin: true,
    },
  });
}

export async function getUserByGitHubID(githubId: string) {
  return await db.user.findUnique({
    where: { githubId },
    include: {
      tenants: true,
      admin: true,
    },
  });
}

export async function register(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  active?: boolean;
  githubId?: string;
  googleId?: string;
  avatarURL?: string;
  locale?: string;
  defaultTenantId?: string | null;
  request: Request;
}) {
  const { email, password, firstName, lastName, active, githubId, googleId, avatarURL, locale, defaultTenantId } = data;
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      avatar: avatarURL ?? "",
      phone: "",
      active,
      githubId,
      googleId,
      locale,
      defaultTenantId,
    },
  });
  await CrmService.createContact({
    tenantId: null,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    jobTitle: "",
    marketingSubscriber: true,
    status: ContactStatus.Customer,
    request: data.request,
  })
    .then((e) => {
      // eslint-disable-next-line no-console
      console.log("[CrmService] Created user contact", {
        email: user.email,
        e,
      });
    })
    .catch((e) => {
      //
    });
  return { id: user.id, email, defaultTenantId: "", locale };
}

export async function updateUserProfile(data: { firstName?: string; lastName?: string; avatar?: string; locale?: string }, userId?: string) {
  if (!userId) {
    return null;
  }
  return await db.user
    .update({
      where: { id: userId },
      data,
    })
    .then((item) => {
      clearCacheKey(`user:${userId}`);
      return item;
    });
}

export async function updateUserVerifyToken(data: { verifyToken: string }, userId?: string) {
  if (!userId) {
    return null;
  }
  return await db.user
    .update({
      where: { id: userId },
      data,
    })
    .then((item) => {
      clearCacheKey(`user:${userId}`);
      return item;
    });
}

export async function updateUserPassword(data: { passwordHash: string }, userId?: string) {
  if (!userId) {
    return null;
  }
  return await db.user
    .update({
      where: { id: userId },
      data: {
        ...data,
        verifyToken: "",
      },
    })
    .then((item) => {
      clearCacheKey(`user:${userId}`);
      return item;
    });
}

export async function updateUserDefaultTenantId(data: { defaultTenantId: string }, userId: string) {
  if (!userId) {
    return null;
  }
  return await db.user
    .update({
      where: { id: userId },
      data,
    })
    .then((item) => {
      clearCacheKey(`user:${userId}`);
      return item;
    });
}

export async function setUserGitHubAccount(data: { githubId: string }, userId: string) {
  if (!userId) {
    return null;
  }
  return await db.user
    .update({
      where: { id: userId },
      data,
    })
    .then((item) => {
      clearCacheKey(`user:${userId}`);
      return item;
    });
}

export async function setUserGoogleAccount(data: { googleId: string }, userId: string) {
  if (!userId) {
    return null;
  }
  return await db.user
    .update({
      where: { id: userId },
      data,
    })
    .then((item) => {
      clearCacheKey(`user:${userId}`);
      return item;
    });
}

export async function deleteUser(userId: string) {
  return await db.user
    .delete({
      where: { id: userId },
    })
    .then((item) => {
      clearCacheKey(`user:${userId}`);
      return item;
    });
}
