import { db } from "../../db.server";
import { Entity, Permission, Role, RolePermission } from "@prisma/client";
import { getAllRolesNames, getRoleByName } from "./roles.db.server";
import { createRolePermission, getAllRolePermissions } from "./rolePermissions.db.server";
import RowFiltersHelper from "~/utils/helpers/RowFiltersHelper";
import { FiltersDto } from "~/application/dtos/data/FiltersDto";
import { getEntityPermissions } from "~/utils/helpers/PermissionsHelper";
import { cachified, clearCacheKey } from "~/utils/cache.server";

export type PermissionWithRoles = Permission & {
  inRoles: (RolePermission & { role: Role })[];
};

export async function getAllPermissions(type?: string, filters?: FiltersDto): Promise<PermissionWithRoles[]> {
  let where: any = {
    type,
  };
  if (filters) {
    where = RowFiltersHelper.getFiltersCondition(filters);
    const roleId = filters?.properties.find((f) => f.name === "roleId")?.value;
    if (roleId) {
      where = {
        OR: [where, { inRoles: { some: { roleId } } }],
      };
    }
    if (type !== undefined) {
      where = {
        AND: [type, where],
      };
    }
  }

  return await db.permission.findMany({
    where,
    include: {
      inRoles: {
        include: {
          role: true,
        },
      },
    },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });
}

export async function getAllPermissionsIdsAndNames(): Promise<{ id: string; name: string }[]> {
  return await db.permission.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function getPermission(id: string): Promise<PermissionWithRoles | null> {
  return await db.permission.findUnique({
    where: {
      id,
    },
    include: {
      inRoles: {
        include: {
          role: true,
        },
      },
    },
  });
}

export async function getPermissionByName(name: string): Promise<PermissionWithRoles | null> {
  return await db.permission.findUnique({
    where: {
      name,
    },
    include: {
      inRoles: {
        include: {
          role: true,
        },
      },
    },
  });
}

export async function getPermissionName(name: string): Promise<{ id: string; name: string; description: string } | null> {
  return await cachified({
    key: `permission:${name}`,
    ttl: 1000 * 60 * 60 * 24,
    getFreshValue: () =>
      db.permission.findUnique({
        where: {
          name,
        },
        select: { id: true, name: true, description: true },
      }),
  });
}

export async function getPermissionByNames(names: string[]): Promise<PermissionWithRoles[]> {
  return await db.permission.findMany({
    where: {
      name: {
        in: names,
      },
    },
    include: {
      inRoles: {
        include: {
          role: true,
        },
      },
    },
  });
}

export async function getNextPermissionsOrder(type?: string): Promise<number> {
  let where = {};
  if (type !== undefined) {
    where = {
      type,
    };
  }
  return (
    ((
      await db.permission.aggregate({
        where,
        _max: {
          order: true,
        },
      })
    )._max.order ?? 0) + 1
  );
}

export async function createPermissions(
  permissions: { inRoles: string[]; name: string; description: string; type: string; entityId?: string | null }[],
  fromOrder: number = 0
) {
  const allRolePermissions = await getAllRolePermissions();
  let allPermissions = await getAllPermissions();
  let createdPermissions: string[] = [];
  await Promise.all(
    permissions.map(async (data, idx) => {
      const existing = allPermissions.find((p) => p.name === data.name);
      if (existing || createdPermissions.includes(data.name)) {
        // eslint-disable-next-line no-console
        console.log("ℹ️ Permission already exists", data.name);
        return;
      }
      const permission = await createPermission({
        order: fromOrder + idx + 1,
        name: data.name,
        description: data.description,
        type: data.type,
        isDefault: true,
        entityId: data.entityId ?? null,
      });
      createdPermissions.push(permission.name);

      await Promise.all(
        data.inRoles.map(async (inRole) => {
          const role = await getRoleByName(inRole);
          if (!role) {
            throw new Error("Role required: " + inRole);
          }
          const existing = allRolePermissions.find((p) => p.roleId === role.id && p.permission.name === permission.name);
          if (existing) {
            return existing;
          }
          return await createRolePermission({
            permissionId: permission.id,
            roleId: role.id,
          });
        })
      );
    })
  );
}

export async function createPermission(data: { order: number; name: string; description: string; type: string; isDefault: boolean; entityId: string | null }) {
  return await db.permission.create({
    data,
  });
}

export async function updatePermission(
  id: string,
  data: {
    name?: string;
    description?: string;
    type?: string;
    order?: number;
  }
) {
  return await db.permission
    .update({
      where: { id },
      data,
    })
    .then((item) => {
      clearCacheKey(`permission:${item.name}`);
      return item;
    });
}

export async function deletePermission(id: string) {
  return await db.permission
    .delete({
      where: { id },
    })
    .then((item) => {
      clearCacheKey(`permission:${item.name}`);
      return item;
    });
}

export async function deleteEntityPermissions(entity: Entity) {
  const entityPermissions = await getEntityPermissions(entity);
  const names = entityPermissions.map((p) => p.name);
  if (names.length > 0) {
    return await db.permission.deleteMany({
      where: {
        name: {
          in: names,
        },
      },
    });
  }
}

export async function createEntityPermissions(entity: Entity) {
  const allUserRoles = await getAllRolesNames();
  // const assignToAllUserRoles = allUserRoles.filter((f) => f.assignToNewUsers);
  const entityPermissions = await getEntityPermissions(entity);
  await Promise.all(
    entityPermissions.map(async (permission, idx) => {
      const entityPermission = {
        inRoles: allUserRoles.map((f) => f.name),
        name: permission.name,
        description: permission.description,
        type: "app",
        entityId: entity.id,
      };
      return await createPermissions([entityPermission], allUserRoles.length + idx + 1);
    })
  );
}
