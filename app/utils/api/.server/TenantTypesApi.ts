import { TenantTypeRelationshipDto } from "~/application/dtos/tenants/TenantTypeRelationshipDto";
import { getAllTenantTypes, getDefaultTenantTypes, getTenantType } from "../../db/tenants/tenantTypes.db.server";
import { FromTenantTypeRelationshipDto } from "~/application/dtos/tenants/FromTenantTypeRelationshipDto";
import {
  addTenantTypeRelationshipPermissions,
  getTenantTypeRelationship,
  removeTenantTypeRelationshipPermissions,
} from "../../db/tenants/tenantTypeRelationships.db.server";
import { getPermission } from "../../db/permissions/permissions.db.server";
import { SubscriptionProductDto } from "~/application/dtos/subscriptions/SubscriptionProductDto";
import { addTenantTypeToTenant, getTenant } from "../../db/tenants.db.server";
import { TenantTypeDto } from "~/application/dtos/tenants/TenantTypeDto";

export namespace TenantTypesApi {
  export async function getRelationships({
    fromTypes,
    hasRelationship,
  }: {
    fromTypes?: TenantTypeDto[];
    hasRelationship?: boolean;
  }): Promise<FromTenantTypeRelationshipDto[]> {
    const relationships: FromTenantTypeRelationshipDto[] = [];

    const types: TenantTypeDto[] = await getAllTenantTypes();

    await Promise.all(
      [null, ...(fromTypes ?? types)].map(async (from) => {
        const fromType: FromTenantTypeRelationshipDto = {
          fromTypeId: from?.id ?? null,
          fromType: from || null,
          to: [],
        };
        relationships.push(fromType);
        await Promise.all(
          [null, ...types].map(async (to) => {
            const relationship = await getRelationship({ fromTypeId: from?.id ?? null, toTypeId: to?.id ?? null });
            if (hasRelationship && !relationship.hasRelationship) {
              return;
            }
            // if (fromType.to.find((f) => f.toTypeId === (to?.id || null))) {
            //   return;
            // }
            fromType.to.push({
              toTypeId: to?.id ?? null,
              toType: to || null,
              relationship,
            });
          })
        );
      })
    );
    return relationships;
  }
  export async function getRelationship({ fromTypeId, toTypeId }: { fromTypeId: string | null; toTypeId: string | null }): Promise<TenantTypeRelationshipDto> {
    const fromType = fromTypeId ? await getTenantType(fromTypeId) : null;
    const toType = toTypeId ? await getTenantType(toTypeId) : null;

    const relationship = await getTenantTypeRelationship({ fromTypeId, toTypeId });
    const tenantTypeRelationship: TenantTypeRelationshipDto = {
      id: relationship?.id,
      fromTypeId: fromTypeId,
      fromType: fromType,
      toTypeId: toTypeId,
      toType: toType,
      hasRelationship: !!relationship,
      canCreate: relationship?.canCreate ?? false,
      permissions: relationship?.permissions,
    };
    return tenantTypeRelationship;
  }
  export async function setPermission({
    fromTypeId,
    toTypeId,
    permission,
  }: {
    fromTypeId: string | null;
    toTypeId: string | null;
    permission: {
      id: string;
      type: "add" | "remove";
    };
  }) {
    const relationship = await getTenantTypeRelationship({ fromTypeId, toTypeId });
    // if (!relationship) {
    //   await createTenantTypeRelationship({ fromTypeId, toTypeId });
    //   relationship = await getTenantTypeRelationship({ fromTypeId, toTypeId });
    // }
    if (!relationship) {
      throw new Error("Relationship not found");
    }
    const existingPermission = await getPermission(permission.id);
    if (!existingPermission) {
      throw new Error("Permission not found");
    }
    if (permission.type === "add") {
      await addTenantTypeRelationshipPermissions(relationship.id, { permissionIds: [permission.id] });
    } else {
      await removeTenantTypeRelationshipPermissions(relationship.id, { permissionIds: [permission.id] });
    }
    // relationship = await getTenantTypeRelationship({ fromTypeId, toTypeId });
    // if (relationship?.permissions.length === 0) {
    //   await deleteTenantTypeRelationship(relationship.id);
    // }
  }
  export async function setPermissions({
    fromTypeId,
    toTypeId,
    type,
    permissionIds,
  }: {
    fromTypeId: string | null;
    toTypeId: string | null;
    type: "add" | "remove";
    permissionIds: string[];
  }) {
    const relationship = await getTenantTypeRelationship({ fromTypeId, toTypeId });
    // if (!relationship) {
    //   await createTenantTypeRelationship({ fromTypeId, toTypeId });
    //   relationship = await getTenantTypeRelationship({ fromTypeId, toTypeId });
    // }
    if (!relationship) {
      throw new Error("Relationship not found");
    }
    if (type === "add") {
      await addTenantTypeRelationshipPermissions(relationship.id, { permissionIds });
    } else {
      await removeTenantTypeRelationshipPermissions(relationship.id, { permissionIds });
    }
    // relationship = await getTenantTypeRelationship({ fromTypeId, toTypeId });
    // if (relationship?.permissions.length === 0) {
    //   await deleteTenantTypeRelationship(relationship.id);
    // }
  }
  export async function setTenantTypes({
    tenantId,
    subscriptionProduct,
    types,
  }: {
    tenantId: string;
    subscriptionProduct?: SubscriptionProductDto;
    types?: string[];
  }) {
    const tenant = await getTenant(tenantId);
    if (!tenant) {
      return;
    }
    if (types) {
      await Promise.all(
        types.map(async (typeId) => {
          await addTenantTypeToTenant(tenant.id, { typeId });
        })
      );
      return;
    }
    const defaultTenantTypes = await getDefaultTenantTypes();
    const allTenantTypes = [...defaultTenantTypes, ...(subscriptionProduct?.assignsTenantTypes ?? [])].filter(
      (v, i, a) => a.findIndex((t) => t.id === v.id) === i
    );
    await Promise.all(
      allTenantTypes.map(async (tenantType) => {
        if (!tenant.types.find((f) => f.id === tenantType.id)) {
          await addTenantTypeToTenant(tenant.id, {
            typeId: tenantType.id,
          });
        }
      })
    );
  }
  // export async function filterEntities({
  //   tenant,
  //   entities,
  //   entityGroups,
  // }: {
  //   tenant: TenantSimple;
  //   entities: EntityWithDetails[];
  //   entityGroups?: EntityGroupWithDetails[];
  // }) {
  //   const tenantTypes = await getAllTenantTypes();
  //   if (tenantTypes.length > 0) {
  //     const tenantEntities = await TenantEntitiesApi.getEntities({ inTypes: tenant.types, enabledOnly: true });
  //     entities = tenantEntities.allEntities;
  //     let newGroups: EntityGroupWithDetails[] = [];
  //     entityGroups?.forEach((group) => {
  //       group.entities = group.entities.filter((f) => entities.some((e) => e.id === f.id));
  //       if (group.entities.length > 0) {
  //         newGroups.push(group);
  //       }
  //     });
  //     entityGroups = newGroups;
  //   }
  // }
}
