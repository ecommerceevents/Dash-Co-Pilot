import { PlanFeatureUsageDto } from "~/application/dtos/subscriptions/PlanFeatureUsageDto";
import { EntityWithDetails, findEntityByName, findEntityBySlug, getEntityByIdOrName, getEntityByPrefix } from "../../db/entities/entities.db.server";
import { getEntityPermission } from "../../helpers/PermissionsHelper";
import { getUserPermission } from "../../helpers/.server/PermissionsService";
import { getPlanFeatureUsage } from "../../services/.server/subscriptionService";
import { getMyTenants } from "../../db/tenants.db.server";
import { getTenantRelationshipsFromByUserTenants } from "../../db/tenants/tenantRelationships.db.server";
import { Entity } from "@prisma/client";
import { Params } from "@remix-run/react";
import { getBaseURL } from "../../url.server";

export namespace EntitiesApi {
  export type GetEntityData = {
    entity: EntityWithDetails;
    featureUsageEntity?: PlanFeatureUsageDto | undefined;
  };
  export type Routes = {
    list?: string;
    new?: string;
    overview?: string;
    edit?: string;
    publicUrl?: string;
    import?: string;
    export?: string;
    group?: string;
  };
  export async function get({ entity, tenantId, userId }: { entity: { id?: string; name?: string }; tenantId?: string | null; userId?: string }) {
    const item = await getEntityByIdOrName({ tenantId, ...entity });
    if (userId) {
      // const { permission, userPermission } = await getUserPermission({ userId, permissionName: getEntityPermission(item, "create"), tenantId });
      // if (permission && !userPermission) {
      //   // TODO: IMPROVE
      //   const myTenants = await getMyTenants(userId);
      //   const childTenants = await getTenantRelationshipsFromByUserTenants(myTenants.map((f) => f.id));
      //   const currentTenantAsChild = childTenants.find((f) => f.toTenantId === tenantId);
      //   const existingPermission = currentTenantAsChild?.tenantTypeRelationship.permissions.find((f) => f.name === getEntityPermission(item, "create"));
      //   // TODO: END IMPROVE
      //   if (!existingPermission) {
      //     throw new Error(`User does not have permission to view entity ${entity.name}`);
      //   }
      // }
    }

    const featureUsageEntity = tenantId ? await getPlanFeatureUsage(tenantId, item.name) : undefined;
    const data: GetEntityData = {
      entity: item,
      featureUsageEntity,
    };
    return data;
  }
  export async function validateEntity({
    tenantId,
    name,
    slug,
    order,
    prefix,
    entity,
  }: {
    tenantId: string | null;
    name: string;
    slug: string;
    order: number | null;
    prefix: string;
    entity?: Entity;
  }) {
    const errors: string[] = [];

    if (!entity || entity?.name !== name) {
      const existingName = await findEntityByName({ tenantId, name });
      if (existingName) {
        errors.push(`Existing entity with name '${name}': ${existingName.slug}`);
      }
    }

    if (!entity || entity?.slug !== slug) {
      const existingSlug = await findEntityBySlug(slug);
      if (existingSlug) {
        errors.push(`Existing entity with slug '${slug}': ${existingSlug.slug}`);
      }
    }

    // if (order) {
    //   if (!entity || entity?.order !== order) {
    //     const existingOrder = await getEntityByOrder(order);
    //     if (existingOrder) {
    //       errors.push(`Existing entity with order '${order}':  ${existingOrder.slug}`);
    //     }
    //   }
    // }

    if (!entity || entity?.prefix !== prefix) {
      const existingPrefix = await getEntityByPrefix(prefix);
      if (existingPrefix) {
        errors.push(`Existing entity with prefix '${prefix}': ${existingPrefix.slug}`);
      }
    }

    return errors;
  }
  export function getNoCodeRoutes({ request, params }: { request: Request; params: Params }): EntitiesApi.Routes {
    const url = new URL(request.url);

    if (params.group) {
      if (url.pathname.startsWith(`/admin/g`)) {
        const routes: EntitiesApi.Routes = {
          list: `/admin/g/${params.group}/:entity`,
          new: `/admin/g/${params.group}/:entity/new`,
          overview: `/admin/g/${params.group}/:entity/:id`,
          edit: `/admin/g/${params.group}/:entity/:id/edit`,
          import: `/admin/g/${params.group}/:entity/import`,
          export: `/admin/g/${params.group}/:entity/export`,
          publicUrl: getBaseURL(request) + `/public/:entity/:id`,
          group: `/admin/g/${params.group}`,
        };
        return routes;
      } else if (url.pathname.startsWith(`/app/${params.tenant}/g`)) {
        const routes: EntitiesApi.Routes = {
          list: `/app/${params?.tenant}/g/${params.group}/:entity`,
          new: `/app/${params?.tenant}/g/${params.group}/:entity/new`,
          overview: `/app/${params?.tenant}/g/${params.group}/:entity/:id`,
          edit: `/app/${params?.tenant}/g/${params.group}/:entity/:id/edit`,
          import: `/app/${params?.tenant}/g/${params.group}/:entity/import`,
          export: `/app/${params?.tenant}/g/${params.group}/:entity/export`,
          publicUrl: getBaseURL(request) + `/public/:entity/:id`,
          group: `/app/${params?.tenant}/g/${params.group}`,
        };
        return routes;
      }
    } else if (url.pathname.startsWith(`/admin/crm`)) {
      const routes: EntitiesApi.Routes = {
        list: `/admin/crm/:entity`,
        new: `/admin/crm/:entity/new`,
        overview: `/admin/crm/:entity/:id`,
        edit: `/admin/crm/:entity/:id/edit`,
        import: `/admin/crm/:entity/import`,
        export: `/admin/crm/:entity/export`,
        publicUrl: getBaseURL(request) + `/public/:entity/:id`,
      };
      return routes;
    } else if (url.pathname.startsWith("/admin/")) {
      const routes: EntitiesApi.Routes = {
        list: `/admin/entities/:entity/no-code/:entity`,
        new: `/admin/entities/:entity/no-code/:entity/new`,
        overview: `/admin/entities/:entity/no-code/:entity/:id`,
        edit: `/admin/entities/:entity/no-code/:entity/:id/edit`,
        import: `/admin/entities/:entity/no-code/:entity/import`,
        export: `/admin/entities/:entity/no-code/:entity/export`,
        publicUrl: getBaseURL(request) + `/public/:entity/:id`,
      };
      return routes;
    } else if (url.pathname.startsWith(`/app/${params?.tenant}/crm`)) {
      const routes: EntitiesApi.Routes = {
        list: `/app/${params?.tenant}/crm/:entity`,
        new: `/app/${params?.tenant}/crm/:entity/new`,
        overview: `/app/${params?.tenant}/crm/:entity/:id`,
        edit: `/app/${params?.tenant}/crm/:entity/:id/edit`,
        import: `/app/${params?.tenant}/crm/:entity/import`,
        export: `/app/${params?.tenant}/crm/:entity/export`,
        publicUrl: getBaseURL(request) + `/public/:entity/:id`,
      };
      return routes;
    }
    const routes: EntitiesApi.Routes = {
      list: `/app/${params?.tenant}/:entity`,
      new: `/app/${params?.tenant}/:entity/new`,
      overview: `/app/${params?.tenant}/:entity/:id`,
      edit: `/app/${params?.tenant}/:entity/:id/edit`,
      import: `/app/${params?.tenant}/:entity/import`,
      export: `/app/${params?.tenant}/:entity/export`,
      publicUrl: getBaseURL(request) + `/public/:entity/:id`,
    };
    return routes;
  }
}
