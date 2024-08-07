import { Entity, EntityRelationship, EntityTag, EntityTemplate, Prisma, Property, PropertyAttribute, PropertyOption } from "@prisma/client";
import Constants from "~/application/Constants";
import { DefaultLogActions } from "~/application/dtos/shared/DefaultLogActions";
import { DefaultVisibility } from "~/application/dtos/shared/DefaultVisibility";
import { defaultProperties } from "~/utils/helpers/PropertyHelper";
import { db } from "../../db.server";
import { EntityRelationshipWithDetails } from "./entityRelationships.db.server";
import { EntityViewWithDetails } from "./entityViews.db.server";
import { createProperties, CreatePropertyDto } from "./properties.db.server";
import EntityModelHelper from "~/utils/helpers/models/EntityModelHelper";
import EntityViewModelHelper from "~/utils/helpers/models/EntityViewModelHelper";
import EntitiesSingleton from "~/modules/rows/repositories/EntitiesSingleton";

export type EntitySimple = {
  id: string;
  order: number;
  name: string;
  title: string;
  titlePlural: string;
  active: boolean;
  slug: string;
  type: string;
  hasApi: boolean;
  showInSidebar: boolean;
  icon: string;
  onEdit: string | null;
};
export type RowsUsage = { entityId: string; _count: number };
export type EntityWithProperties = Entity & {
  properties: PropertyWithDetails[];
};
export type EntityWithDetails = Entity & {
  properties: PropertyWithDetails[];
  views: EntityViewWithDetails[];
  tags: EntityTag[];
  parentEntities: EntityRelationshipWithDetails[];
  childEntities: EntityRelationshipWithDetails[];
  templates: EntityTemplate[];
};
export type EntityWithDetailsAndRelationships = EntityWithDetails & {
  parentEntities: (EntityRelationship & { parent: { id: string; name: string; title: string; titlePlural: string; slug: string; onEdit: string | null } })[];
  childEntities: (EntityRelationship & { parent: { id: string; name: string; title: string; titlePlural: string; slug: string; onEdit: string | null } })[];
};
export type EntityWithCount = EntityWithDetails & {
  _count: { rows: number };
  inTenantTypes: { tenantType: { title: string } | null }[];
};

export type PropertyWithDetails = Property & {
  // entity: EntityWithDetails;
  attributes: PropertyAttribute[];
  options: PropertyOption[];
  parent?: PropertyWithDetails;
  formula: { name: string; resultAs: string; calculationTrigger: string } | null;
};

// const includeEntityWithDetails = {
//   properties: {
//     include: {
//       options: true,
//     },
//   },
// };

export async function getEntitiesInIds(ids: string[]) {
  return await db.entity.findMany({
    where: { id: { in: ids } },
  });
}

export async function getAllEntities({
  tenantId,
  active,
  types,
}: {
  tenantId: string | null | undefined;
  active?: boolean;
  types?: string[];
}): Promise<EntityWithDetails[]> {
  let where: Prisma.EntityWhereInput = {};
  if (active) {
    where = { active };
  }
  if (types) {
    where = { ...where, type: { in: types } };
  }
  const allEntities = await db.entity.findMany({
    where,
    orderBy: [
      { type: "asc" },
      {
        order: "asc",
      },
    ],
    include: {
      views: { include: { properties: true, filters: true, sort: true, groupByProperty: true } },
      tags: true,
      parentEntities: {
        include: {
          parent: { select: EntityModelHelper.selectEntityWithoutIcon },
          child: { select: EntityModelHelper.selectEntityWithoutIcon },
          childEntityView: { include: EntityViewModelHelper.includeDetails },
          parentEntityView: { include: EntityViewModelHelper.includeDetails },
        },
        orderBy: { order: "asc" },
      },
      childEntities: {
        include: {
          parent: { select: EntityModelHelper.selectEntityWithoutIcon },
          child: { select: EntityModelHelper.selectEntityWithoutIcon },
          childEntityView: { include: EntityViewModelHelper.includeDetails },
          parentEntityView: { include: EntityViewModelHelper.includeDetails },
        },
        orderBy: { order: "asc" },
      },
      properties: {
        where: { ...filterTenantId(tenantId) },
        orderBy: { order: "asc" },
        include: {
          attributes: true,
          options: {
            orderBy: {
              order: "asc",
            },
          },
          formula: { select: { name: true, resultAs: true, calculationTrigger: true } },
        },
      },
      templates: {
        where: { ...filterTenantId(tenantId) },
      },
    },
  });
  EntitiesSingleton.getInstance().setEntities(allEntities);
  return allEntities;
}

export async function getAllEntitiesSimple({ active, types }: { active?: boolean; types?: string[] } = {}): Promise<EntitySimple[]> {
  let where: Prisma.EntityWhereInput = {};
  if (active) {
    where = { active };
  }
  if (types) {
    where = { ...where, type: { in: types } };
  }
  return await db.entity.findMany({
    where,
    orderBy: [
      { type: "asc" },
      {
        order: "asc",
      },
    ],
    select: EntityModelHelper.selectSimpleProperties,
  });
}

export async function getEntitySimple({ id, name }: { id?: string; name?: string }): Promise<EntitySimple | null> {
  if (!id && !name) {
    return null;
  } else if (id) {
    return await db.entity.findUnique({
      where: {
        id,
      },
      select: EntityModelHelper.selectSimpleProperties,
    });
  } else {
    return await db.entity.findUnique({
      where: {
        name,
      },
      select: EntityModelHelper.selectSimpleProperties,
    });
  }
}

export async function getEntitiesByName(name: string[]) {
  return await db.entity.findMany({
    where: {
      name: {
        in: name,
      },
    },
  });
}

export async function getAllEntitiesWithRowCount({ tenantId }: { tenantId: string | null }): Promise<EntityWithCount[]> {
  return await db.entity.findMany({
    include: {
      views: { include: { properties: true, filters: true, sort: true, groupByProperty: true } },
      tags: true,
      parentEntities: {
        include: {
          parent: { select: EntityModelHelper.selectEntityWithoutIcon },
          child: { select: EntityModelHelper.selectEntityWithoutIcon },
          childEntityView: { include: EntityViewModelHelper.includeDetails },
          parentEntityView: { include: EntityViewModelHelper.includeDetails },
        },
        orderBy: { order: "asc" },
      },
      childEntities: {
        include: {
          parent: { select: EntityModelHelper.selectEntityWithoutIcon },
          child: { select: EntityModelHelper.selectEntityWithoutIcon },
          childEntityView: { include: EntityViewModelHelper.includeDetails },
          parentEntityView: { include: EntityViewModelHelper.includeDetails },
        },
        orderBy: { order: "asc" },
      },
      templates: {
        where: { ...filterTenantId(tenantId) },
      },
      _count: {
        select: {
          rows: true,
        },
      },
      inTenantTypes: { include: { tenantType: { select: { title: true } } } },
      properties: {
        where: { ...filterTenantId(tenantId) },
        orderBy: { order: "asc" },
        include: {
          attributes: true,
          options: {
            orderBy: {
              order: "asc",
            },
          },
          formula: { select: { name: true, resultAs: true, calculationTrigger: true } },
        },
      },
    },
    orderBy: [
      { type: "asc" },
      {
        order: "asc",
      },
    ],
  });
}

export async function getAllRowsUsage(tenantId: string): Promise<RowsUsage[]> {
  const countEntities = await db.row.groupBy({
    by: ["entityId"],
    _count: true,
    where: {
      OR: [
        {
          tenantId,
        },
      ],
    },
  });
  return countEntities;
}

// export async function getRowsCount(tenantId: string, entityId: string): Promise<number> {
//   const whereTenant = {
//     OR: [
//       {
//         tenantId,
//       },
//       {
//         linkedAccount: {
//           OR: [
//             {
//               providerTenantId: tenantId,
//             },
//             {
//               clientTenantId: tenantId,
//             },
//           ],
//         },
//       },
//     ],
//   };
//   if (!entityLimit || entityLimit.type === EntityLimitType.MAX) {
//     return await db.row.count({
//       where: {
//         entityId,
//         ...whereTenant,
//       },
//     });
//   } else {
//     return await db.row.count({
//       where: {
//         entityId: entityLimit.entityId,
//         ...whereTenant,
//         // TODO: CURRENT MONTH
//       },
//     });
//   }
// }

export async function getEntityById({ id, tenantId }: { id: string; tenantId: string | null | undefined }): Promise<EntityWithDetailsAndRelationships | null> {
  return await db.entity.findUnique({
    where: {
      id,
    },
    include: {
      views: { include: { properties: true, filters: true, sort: true, groupByProperty: true } },
      tags: true,
      parentEntities: {
        include: {
          parent: { select: EntityModelHelper.selectEntityWithoutIcon },
          child: { select: EntityModelHelper.selectEntityWithoutIcon },
          childEntityView: { include: EntityViewModelHelper.includeDetails },
          parentEntityView: { include: EntityViewModelHelper.includeDetails },
        },
        orderBy: { order: "asc" },
      },
      childEntities: {
        include: {
          parent: { select: EntityModelHelper.selectEntityWithoutIcon },
          child: { select: EntityModelHelper.selectEntityWithoutIcon },
          childEntityView: { include: EntityViewModelHelper.includeDetails },
          parentEntityView: { include: EntityViewModelHelper.includeDetails },
        },
        orderBy: { order: "asc" },
      },
      properties: {
        where: { ...filterTenantId(tenantId) },
        orderBy: { order: "asc" },
        include: {
          attributes: true,
          options: {
            orderBy: {
              order: "asc",
            },
          },
          formula: { select: { name: true, resultAs: true, calculationTrigger: true } },
        },
      },
      templates: {
        where: { ...filterTenantId(tenantId) },
      },
    },
  });
}

export async function getEntityBySlug({
  tenantId,
  slug,
  activeOnly,
}: {
  tenantId: string | null;
  slug: string;
  activeOnly?: boolean;
}): Promise<EntityWithDetails> {
  const entity = await db.entity.findUnique({
    where: {
      slug,
    },
    include: {
      views: { include: { properties: true, filters: true, sort: true, groupByProperty: true } },
      tags: true,
      parentEntities: {
        include: {
          parent: { select: EntityModelHelper.selectEntityWithoutIcon },
          child: { select: EntityModelHelper.selectEntityWithoutIcon },
          childEntityView: { include: EntityViewModelHelper.includeDetails },
          parentEntityView: { include: EntityViewModelHelper.includeDetails },
        },
        orderBy: { order: "asc" },
      },
      childEntities: {
        include: {
          parent: { select: EntityModelHelper.selectEntityWithoutIcon },
          child: { select: EntityModelHelper.selectEntityWithoutIcon },
          childEntityView: { include: EntityViewModelHelper.includeDetails },
          parentEntityView: { include: EntityViewModelHelper.includeDetails },
        },
        orderBy: { order: "asc" },
      },
      properties: {
        where: { ...filterTenantId(tenantId) },
        orderBy: { order: "asc" },
        include: {
          attributes: true,
          // entity: {
          //   include: {
          //     ...includePropertiesWithDetails,
          //   },
          // },
          options: {
            orderBy: {
              order: "asc",
            },
          },
          formula: { select: { name: true, resultAs: true, calculationTrigger: true } },
        },
      },
      templates: {
        where: { ...filterTenantId(tenantId) },
      },
    },
  });
  if (!entity) {
    throw new Error(`Entity '${slug}' not found`);
  }
  if (activeOnly && !entity.active) {
    throw new Error(`Entity '${slug}' is not active`);
  }
  return entity;
}

export async function getSimpleEntityBySlug(slug: string): Promise<EntitySimple | null> {
  return await db.entity.findUnique({
    where: {
      slug,
    },
    select: EntityModelHelper.selectSimpleProperties,
  });
}

export async function findEntityBySlug(slug: string): Promise<Entity | null> {
  return await db.entity.findUnique({
    where: { slug },
  });
}

export async function getEntityByName({ tenantId, name }: { tenantId: string | null | undefined; name: string }): Promise<EntityWithDetails> {
  const entity = await db.entity.findUnique({
    where: {
      name,
    },
    include: {
      views: { include: { properties: true, filters: true, sort: true, groupByProperty: true } },
      tags: true,
      parentEntities: {
        include: {
          parent: { select: EntityModelHelper.selectEntityWithoutIcon },
          child: { select: EntityModelHelper.selectEntityWithoutIcon },
          childEntityView: { include: EntityViewModelHelper.includeDetails },
          parentEntityView: { include: EntityViewModelHelper.includeDetails },
        },
        orderBy: { order: "asc" },
      },
      childEntities: {
        include: {
          parent: { select: EntityModelHelper.selectEntityWithoutIcon },
          child: { select: EntityModelHelper.selectEntityWithoutIcon },
          childEntityView: { include: EntityViewModelHelper.includeDetails },
          parentEntityView: { include: EntityViewModelHelper.includeDetails },
        },
        orderBy: { order: "asc" },
      },
      properties: {
        where: { ...filterTenantId(tenantId) },
        orderBy: { order: "asc" },
        include: {
          // entity: {
          //   include: {
          //     ...includePropertiesWithDetails,
          //   },
          // },
          attributes: true,
          options: {
            orderBy: {
              order: "asc",
            },
          },
          formula: { select: { name: true, resultAs: true, calculationTrigger: true } },
        },
      },
      templates: {
        where: { ...filterTenantId(tenantId) },
      },
    },
  });
  if (!entity) {
    throw new Error(`Entity with name ${name} not found`);
  }
  return entity;
}

export async function getEntityByIdOrName({
  tenantId,
  id,
  name,
}: {
  tenantId: string | null | undefined;
  id?: string;
  name?: string;
}): Promise<EntityWithDetails> {
  let entity: EntityWithDetails | null = null;
  if (id) {
    entity = await getEntityById({ tenantId, id });
  } else if (name) {
    entity = await getEntityByName({ tenantId, name });
  }
  if (!entity) {
    throw new Error(`Entity with id ${id} or name ${name} not found`);
  }
  return entity;
}

export async function getEntityByIdNameOrSlug({ tenantId, idNameOrSlug }: { tenantId: string | null; idNameOrSlug: string }): Promise<EntityWithDetails> {
  return getEntityWithWhere({
    tenantId,
    where: {
      OR: [{ id: idNameOrSlug }, { name: idNameOrSlug }, { slug: idNameOrSlug }],
    },
  });
}

async function getEntityWithWhere({ tenantId, where }: { tenantId: string | null; where: Prisma.EntityWhereInput }) {
  const entity = await db.entity.findFirst({
    where,
    include: {
      views: { include: { properties: true, filters: true, sort: true, groupByProperty: true } },
      tags: true,
      parentEntities: {
        include: {
          parent: { select: EntityModelHelper.selectEntityWithoutIcon },
          child: { select: EntityModelHelper.selectEntityWithoutIcon },
          childEntityView: { include: EntityViewModelHelper.includeDetails },
          parentEntityView: { include: EntityViewModelHelper.includeDetails },
        },
        orderBy: { order: "asc" },
      },
      childEntities: {
        include: {
          parent: { select: EntityModelHelper.selectEntityWithoutIcon },
          child: { select: EntityModelHelper.selectEntityWithoutIcon },
          childEntityView: { include: EntityViewModelHelper.includeDetails },
          parentEntityView: { include: EntityViewModelHelper.includeDetails },
        },
        orderBy: { order: "asc" },
      },
      properties: {
        where: { ...filterTenantId(tenantId) },
        orderBy: { order: "asc" },
        include: {
          // entity: {
          //   include: {
          //     ...includePropertiesWithDetails,
          //   },
          // },
          attributes: true,
          options: {
            orderBy: {
              order: "asc",
            },
          },
          formula: { select: { name: true, resultAs: true, calculationTrigger: true } },
        },
      },
      templates: {
        where: { ...filterTenantId(tenantId) },
      },
    },
  });
  if (!entity) {
    throw new Error(`Entity not found`);
  }
  return entity;
}

export async function findEntityByName({ tenantId, name }: { tenantId: string | null; name: string }): Promise<EntityWithDetails | null> {
  return await db.entity.findUnique({
    where: { name },
    include: {
      views: { include: { properties: true, filters: true, sort: true, groupByProperty: true } },
      tags: true,
      parentEntities: {
        include: {
          parent: { select: EntityModelHelper.selectEntityWithoutIcon },
          child: { select: EntityModelHelper.selectEntityWithoutIcon },
          childEntityView: { include: EntityViewModelHelper.includeDetails },
          parentEntityView: { include: EntityViewModelHelper.includeDetails },
        },
        orderBy: { order: "asc" },
      },
      childEntities: {
        include: {
          parent: { select: EntityModelHelper.selectEntityWithoutIcon },
          child: { select: EntityModelHelper.selectEntityWithoutIcon },
          childEntityView: { include: EntityViewModelHelper.includeDetails },
          parentEntityView: { include: EntityViewModelHelper.includeDetails },
        },
        orderBy: { order: "asc" },
      },
      properties: {
        where: { ...filterTenantId(tenantId) },
        orderBy: { order: "asc" },
        include: {
          // entity: {
          //   include: {
          //     ...includePropertiesWithDetails,
          //   },
          // },
          attributes: true,
          options: {
            orderBy: {
              order: "asc",
            },
          },
          formula: { select: { name: true, resultAs: true, calculationTrigger: true } },
        },
      },
      templates: {
        where: { ...filterTenantId(tenantId) },
      },
    },
  });
}

export async function findSimpleEntityByName(name: string): Promise<{ id: string; title: string; titlePlural: string; slug: string } | null> {
  if (EntitiesSingleton.getInstance().isSet()) {
    return (
      EntitiesSingleton.getInstance()
        .getEntities()
        .find((f) => f.name === name) ?? null
    );
  }
  return await db.entity.findUnique({
    where: { name },
    select: { id: true, title: true, titlePlural: true, slug: true },
  });
}

export async function getEntityByPrefix(prefix: string): Promise<Entity | null> {
  return await db.entity.findUnique({
    where: {
      prefix,
    },
  });
}

export async function createEntity(
  data: {
    name: string;
    slug: string;
    prefix: string;
    title: string;
    titlePlural: string;
    isAutogenerated: boolean;
    type: string;
    hasApi: boolean;
    icon: string;
    active: boolean;
    showInSidebar: boolean;
    hasTags: boolean;
    hasComments: boolean;
    hasTasks: boolean;
    hasActivity: boolean;
    hasBulkDelete: boolean;
    hasViews: boolean;
    defaultVisibility: string;
    onCreated: string | null;
    onEdit: string | null;
  },
  order?: number | null
) {
  if (!order) {
    order = (await getMaxEntityOrder()) + 1;
  }
  const entity = await db.entity.create({
    data: {
      ...data,
      order,
    },
  });

  const webhooks = [
    {
      action: DefaultLogActions.Created,
      method: "POST",
      endpoint: "",
    },
    {
      action: DefaultLogActions.Updated,
      method: "POST",
      endpoint: "",
    },
    {
      action: DefaultLogActions.Created,
      method: "POST",
      endpoint: "",
    },
  ];

  await Promise.all(
    webhooks.map(async (webhook) => {
      return await db.entityWebhook.create({
        data: {
          entityId: entity.id,
          action: webhook.action,
          method: webhook.method,
          endpoint: webhook.endpoint,
        },
      });
    })
  );

  await Promise.all(
    defaultProperties.map(async (property) => {
      return await db.property.create({
        data: {
          entityId: entity.id,
          ...property,
        },
      });
    })
  );

  return entity;
}

export async function createCoreEntity(
  data: {
    name: string;
    slug: string;
    title: string;
    titlePlural: string;
    prefix: string;
    type: string;
    isAutogenerated?: boolean;
    hasApi?: boolean;
    icon?: string;
    active?: boolean;
    showInSidebar?: boolean;
    hasTags?: boolean;
    hasComments?: boolean;
    hasTasks?: boolean;
    hasActivity?: boolean;
    hasBulkDelete?: boolean;
    hasViews?: boolean;
    defaultVisibility?: DefaultVisibility;
    onCreated?: string | null;
    onEdit?: string | null;
  },
  properties?: CreatePropertyDto[]
) {
  const entity = await createEntity({
    name: data.name,
    slug: data.slug,
    prefix: data.prefix,
    title: data.title,
    titlePlural: data.titlePlural,
    type: data.type,
    isAutogenerated: data.isAutogenerated !== undefined ? data.isAutogenerated : true,
    hasApi: data.hasApi !== undefined ? data.hasApi : true,
    icon: data.icon !== undefined ? data.icon : "",
    active: data.active !== undefined ? data.active : true,
    showInSidebar: data.showInSidebar !== undefined ? data.showInSidebar : true,
    hasTags: data.hasTags !== undefined ? data.hasTags : true,
    hasComments: data.hasComments !== undefined ? data.hasComments : true,
    hasTasks: data.hasTasks !== undefined ? data.hasTasks : false,
    hasActivity: data.hasActivity !== undefined ? data.hasActivity : true,
    hasBulkDelete: data.hasBulkDelete !== undefined ? data.hasBulkDelete : false,
    hasViews: data.hasViews !== undefined ? data.hasViews : true,
    defaultVisibility: data.defaultVisibility ?? Constants.DEFAULT_ROW_VISIBILITY,
    onCreated: data.onCreated ?? "redirectToOverview",
    onEdit: data.onEdit ?? "editRoute",
  });
  if (properties) {
    await createProperties(entity.id, properties);
  }
  return entity;
}

export async function updateEntity(
  id: string,
  data: {
    name?: string;
    slug?: string;
    order?: number;
    prefix?: string;
    title?: string;
    titlePlural?: string;
    isAutogenerated?: boolean;
    type?: string;
    hasApi?: boolean;
    icon?: string;
    active?: boolean;
    showInSidebar?: boolean;
    hasTags?: boolean;
    hasComments?: boolean;
    hasTasks?: boolean;
    hasActivity?: boolean;
    hasBulkDelete?: boolean;
    hasViews?: boolean;
    defaultVisibility?: string;
    onCreated?: string | null;
    onEdit?: string | null;
  }
) {
  return await db.entity.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteEntity(id: string) {
  return await db.entity.delete({
    where: {
      id,
    },
  });
}

export default async function getMaxEntityOrder(): Promise<number> {
  return (
    (
      await db.entity.aggregate({
        _max: {
          order: true,
        },
      })
    )._max?.order ?? 0
  );
}

export async function getDefaultEntityVisibility(id: string): Promise<DefaultVisibility> {
  return ((
    await db.entity.findUnique({
      where: { id },
      select: {
        defaultVisibility: true,
      },
    })
  )?.defaultVisibility ?? Constants.DEFAULT_ROW_VISIBILITY) as DefaultVisibility;
}

function filterTenantId(tenantId: string | null | undefined) {
  const filter: { tenantId?: string | null; OR?: { tenantId?: string | null }[] } = {};
  if (tenantId === undefined) {
    return filter;
  } else if (tenantId === null) {
    filter.tenantId = null;
  } else {
    filter.OR = [{ tenantId: null }, { tenantId }];
  }
  return filter;
}
