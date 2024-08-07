import { db } from "~/utils/db.server";

export async function getRowRelationship(id: string) {
  return await db.rowRelationship.findUnique({
    where: { id },
    include: {
      relationship: true,
    },
  });
}

export async function getRowsRelationship({ parentId, childId }: { parentId: string; childId: string }) {
  return await db.rowRelationship.findFirst({
    where: { parentId, childId },
  });
}

export async function createRowRelationship({
  parentId,
  childId,
  relationshipId,
  metadata,
}: {
  parentId: string;
  childId: string;
  relationshipId: string;
  metadata: string | null;
}) {
  return await db.rowRelationship
    .create({
      data: {
        parentId,
        childId,
        relationshipId,
        metadata,
      },
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.log("Error creating row relationship: " + e.message);
    });
}

export async function deleteRowRelationship({ parentId, childId }: { parentId: string; childId: string }) {
  return await db.rowRelationship.deleteMany({
    where: {
      parentId,
      childId,
    },
  });
}

export async function deleteRowRelationshipById(id: string) {
  return await db.rowRelationship.delete({
    where: {
      id,
    },
  });
}
