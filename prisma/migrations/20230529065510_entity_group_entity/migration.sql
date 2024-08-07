/*
  Warnings:

  - You are about to drop the `_EntityToEntityGroup` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_EntityToEntityGroup" DROP CONSTRAINT "_EntityToEntityGroup_A_fkey";

-- DropForeignKey
ALTER TABLE "_EntityToEntityGroup" DROP CONSTRAINT "_EntityToEntityGroup_B_fkey";

-- AlterTable
ALTER TABLE "Entity" ADD COLUMN     "onEdit" TEXT DEFAULT 'editRoute';

-- AlterTable
ALTER TABLE "EntityRelationship" ADD COLUMN     "entityViewId" TEXT;

-- DropTable
DROP TABLE "_EntityToEntityGroup";

-- CreateTable
CREATE TABLE "EntityGroupEntity" (
    "id" TEXT NOT NULL,
    "entityGroupId" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "allViewId" TEXT,

    CONSTRAINT "EntityGroupEntity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EntityRelationship" ADD CONSTRAINT "EntityRelationship_entityViewId_fkey" FOREIGN KEY ("entityViewId") REFERENCES "EntityView"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityGroupEntity" ADD CONSTRAINT "EntityGroupEntity_entityGroupId_fkey" FOREIGN KEY ("entityGroupId") REFERENCES "EntityGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityGroupEntity" ADD CONSTRAINT "EntityGroupEntity_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityGroupEntity" ADD CONSTRAINT "EntityGroupEntity_allViewId_fkey" FOREIGN KEY ("allViewId") REFERENCES "EntityView"("id") ON DELETE CASCADE ON UPDATE CASCADE;
