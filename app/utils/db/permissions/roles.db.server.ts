import { db } from "../../db.server";
import { Permission, Role, RolePermission, UserRole } from "@prisma/client";
import { FiltersDto } from "~/application/dtos/data/FiltersDto";
import RowFiltersHelper from "~/utils/helpers/RowFiltersHelper";
import { UserSimple } from "../users.db.server";
import UserModelHelper from "~/utils/helpers/models/UserModelHelper";
import { cachified, clearCacheKey } from "~/utils/cache.server";

export type RoleWithPermissions = Role & {
  permissions: (RolePermission & { permission: Permission })[];
};

export type RoleWithPermissionsAndUsers = RoleWithPermissions & {
  users: (UserRole & { user: UserSimple })[];
};

export async function getAllRoles(type?: "admin" | "app"): Promise<RoleWithPermissions[]> {
  let where = {};
  if (type !== undefined) {
    where = {
      type,
    };
  }

  return await db.role.findMany({
    where,
    include: {
      permissions: {
        include: {
          permission: true,
        },
        orderBy: { permission: { name: "asc" } },
      },
    },
    orderBy: [
      {
        type: "asc",
      },
      {
        order: "asc",
      },
    ],
  });
}

export async function getAllRolesNames(): Promise<{ id: string; name: string }[]> {
  return await db.role.findMany({
    select: { id: true, name: true },
    orderBy: [{ type: "asc" }, { order: "asc" }],
  });
}

export async function getAllRolesWithoutPermissions(type?: "admin" | "app"): Promise<Role[]> {
  let where = {};
  if (type !== undefined) {
    where = {
      type,
    };
  }

  return await cachified({
    key: `roles:${type}`,
    ttl: 1000 * 60 * 60 * 24,
    getFreshValue: () =>
      db.role.findMany({
        where,
        orderBy: [
          {
            type: "asc",
          },
          {
            order: "asc",
          },
        ],
      }),
  });
}

export async function getAllRolesWithUsers(type?: "admin" | "app", filters?: FiltersDto): Promise<RoleWithPermissionsAndUsers[]> {
  let where: any = {
    type,
  };
  if (filters !== undefined) {
    where = RowFiltersHelper.getFiltersCondition(filters);
    const permissionId = filters?.properties.find((f) => f.name === "permissionId")?.value;
    if (permissionId) {
      where = {
        OR: [where, { permissions: { some: { permissionId } } }],
      };
    }
    if (type !== undefined) {
      where = {
        AND: [type, where],
      };
    }
  }
  return await db.role.findMany({
    where,
    include: {
      permissions: {
        include: {
          permission: true,
        },
        orderBy: { permission: { name: "asc" } },
      },
      users: {
        include: {
          ...UserModelHelper.includeSimpleUser,
        },
      },
    },
    orderBy: [
      {
        type: "asc",
      },
      {
        order: "asc",
      },
    ],
  });
}

export async function getRoles(ids: string[]): Promise<RoleWithPermissionsAndUsers[]> {
  return await db.role.findMany({
    where: {
      id: {
        in: ids,
      },
    },
    include: {
      permissions: {
        include: {
          permission: true,
        },
        orderBy: { permission: { name: "asc" } },
      },
      users: {
        include: {
          ...UserModelHelper.includeSimpleUser,
        },
      },
    },
  });
}

export async function getRolesByName(names: string[]): Promise<RoleWithPermissionsAndUsers[]> {
  return await db.role.findMany({
    where: {
      name: {
        in: names,
      },
    },
    include: {
      permissions: {
        include: {
          permission: true,
        },
        orderBy: { permission: { name: "asc" } },
      },
      users: {
        include: {
          ...UserModelHelper.includeSimpleUser,
        },
      },
    },
  });
}

export async function getRole(id: string): Promise<RoleWithPermissions | null> {
  return await db.role.findUnique({
    where: {
      id,
    },
    include: {
      permissions: {
        include: {
          permission: true,
        },
        orderBy: { permission: { name: "asc" } },
      },
    },
  });
}

export async function getRoleByName(name: string): Promise<RoleWithPermissions | null> {
  return await db.role.findUnique({
    where: {
      name,
    },
    include: {
      permissions: {
        include: {
          permission: true,
        },
        orderBy: { permission: { name: "asc" } },
      },
    },
  });
}

export async function getNextRolesOrder(type?: "admin" | "app"): Promise<number> {
  let where = {};
  if (type !== undefined) {
    where = {
      type,
    };
  }
  return (
    ((
      await db.role.aggregate({
        where,
        _max: {
          order: true,
        },
      })
    )._max.order ?? 0) + 1
  );
}

export async function createRole(data: {
  order: number;
  name: string;
  description: string;
  type: "admin" | "app";
  assignToNewUsers: boolean;
  isDefault: boolean;
}) {
  return await db.role
    .create({
      data,
    })
    .then((item) => {
      clearCacheKey(`roles:${data.type}`);
      return item;
    });
}

export async function updateRole(id: string, data: { name: string; description: string; type: "admin" | "app"; assignToNewUsers: boolean }) {
  return await db.role
    .update({
      where: { id },
      data,
    })
    .then((item) => {
      clearCacheKey(`roles:${item.type}`);
      return item;
    });
}

export async function deleteRole(id: string) {
  return await db.role
    .delete({
      where: { id },
    })
    .then((item) => {
      clearCacheKey(`roles:${item.type}`);
      return item;
    });
}
