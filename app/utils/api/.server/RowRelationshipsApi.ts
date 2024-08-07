import { createRowRelationship, deleteRowRelationship, deleteRowRelationshipById, getRowRelationship } from "../../db/entities/rowRelationships.db.server";
import { getEntitiesRelationship } from "../../db/entities/entityRelationships.db.server";
import { TimeFunction, timeFake } from "~/modules/metrics/services/.server/MetricTracker";
import { RowsApi } from "./RowsApi";
import { EntityWithDetails, EntityWithDetailsAndRelationships, getEntityById, getEntityByName } from "../../db/entities/entities.db.server";

export namespace RowRelationshipsApi {
  export async function getRelationship(
    id: string,
    {
      tenantId,
      userId,
      time,
    }: {
      userId: string | undefined;
      tenantId: string | null;
      time?: TimeFunction;
    }
  ) {
    if (!time) {
      time = timeFake;
    }
    const relationship = await time(getRowRelationship(id), "RowRelationshipsApi.getRelationship");
    if (!relationship) {
      return null;
    }
    const parent = await RowsApi.get(relationship.parentId, {
      entity: {
        id: relationship.relationship.parentId,
      },
      tenantId,
      userId,
    });
    const child = await RowsApi.get(relationship.childId, {
      entity: {
        id: relationship.relationship.childId,
      },
      tenantId,
      userId,
    });
    return {
      ...relationship,
      parent,
      child,
    };
  }
  export async function createRelationship({
    parent,
    child,
    time,
    allEntities,
    metadata,
  }: {
    parent: { id: string; entityId: string } | { id: string; entityName: string };
    child: { id: string; entityId: string } | { id: string; entityName: string };
    metadata?: string | null;
    time?: TimeFunction;
    allEntities?: EntityWithDetails[];
  }) {
    if (!time) {
      time = timeFake;
    }

    const { relationship } = await getParentChildEntities({ parent, child, allEntities });
    return await time(
      createRowRelationship({
        relationshipId: relationship.id,
        parentId: parent.id,
        childId: child.id,
        metadata: metadata || null,
      }),
      "RowRelationshipsApi.createRelationship.createRowRelationship"
    );
  }
  export async function createRelationshipWithIds({
    parentEntityId,
    childEntityId,
    parentId,
    childId,
    metadata,
    time,
    allEntities,
  }: {
    parentEntityId: string;
    childEntityId: string;
    parentId: string;
    childId: string;
    metadata: string | null;
    time?: TimeFunction;
    allEntities?: EntityWithDetails[];
  }) {
    if (!time) {
      time = timeFake;
    }
    const { relationship } = await getParentChildEntities({
      parent: { id: parentId, entityId: parentEntityId },
      child: { id: childId, entityId: childEntityId },
      allEntities,
    });
    return await time(
      createRowRelationship({
        relationshipId: relationship.id,
        parentId,
        childId,
        metadata,
      }),
      "RowRelationshipsApi.createRelationship.createRowRelationship"
    );
  }
  export async function deleteRelationship({
    parent,
    child,
    time,
    allEntities,
  }: {
    parent: { id: string; entityId: string } | { id: string; entityName: string };
    child: { id: string; entityId: string } | { id: string; entityName: string };
    time?: TimeFunction;
    allEntities?: EntityWithDetails[];
  }) {
    if (!time) {
      time = timeFake;
    }
    const { parentEntity, childEntity } = await getParentChildEntities({ parent, child, allEntities });
    const relationship = await time(
      getEntitiesRelationship({
        parentEntityId: parentEntity.id,
        childEntityId: childEntity.id,
      }),
      "RowRelationshipsApi.deleteRelationship.getEntitiesRelationship"
    );
    if (!relationship) {
      throw Error(`No relationship found between ${parentEntity.name} and ${childEntity.name}`);
    }
    return await time(
      deleteRowRelationship({
        parentId: parent.id,
        childId: child.id,
      }),
      "RowRelationshipsApi.deleteRelationship.deleteRowRelationship"
    );
  }
  async function getParentChildEntities({
    parent,
    child,
    allEntities,
  }: {
    parent: { id: string; entityId: string } | { id: string; entityName: string };
    child: { id: string; entityId: string } | { id: string; entityName: string };
    allEntities?: EntityWithDetails[];
  }) {
    let parentEntity: EntityWithDetailsAndRelationships | null = null;
    let childEntity: EntityWithDetailsAndRelationships | null = null;
    if ("entityName" in parent) {
      parentEntity = allEntities
        ? allEntities.find((e) => e.name === parent.entityName) || null
        : await getEntityByName({ tenantId: undefined, name: parent.entityName });
    } else {
      parentEntity = allEntities
        ? allEntities.find((e) => e.id === parent.entityId) || null
        : await getEntityById({ tenantId: undefined, id: parent.entityId });
    }
    if ("entityName" in child) {
      childEntity = allEntities
        ? allEntities.find((e) => e.name === child.entityName) || null
        : await getEntityByName({ tenantId: undefined, name: child.entityName });
    } else {
      childEntity = allEntities ? allEntities.find((e) => e.id === child.entityId) || null : await getEntityById({ tenantId: undefined, id: child.entityId });
    }
    if (!parentEntity) {
      throw Error(`Invalid parent entity ${JSON.stringify(parent)}`);
    }
    if (!childEntity) {
      throw Error(`Invalid child entity ${JSON.stringify(child)}`);
    }
    const relationship = parentEntity.childEntities.find((e) => e.childId === childEntity!.id);
    if (!relationship) {
      throw Error(`No relationship found between ${parentEntity?.name} and ${childEntity?.name}`);
    }
    return {
      parentEntity,
      childEntity,
      relationship,
    };
  }
  export async function deleteRelationshipById(
    id: string,
    {
      tenantId,
      userId,
      time,
    }: {
      tenantId: string | null;
      userId: string | undefined;
      time?: TimeFunction;
    }
  ) {
    if (!time) {
      time = timeFake;
    }
    const relationship = await getRelationship(id, { tenantId, userId, time });
    if (!relationship) {
      throw Error(`No relationship found with id ${id}`);
    }
    return await time(deleteRowRelationshipById(id), "RowRelationshipsApi.deleteRelationship.deleteRowRelationship");
  }
}
