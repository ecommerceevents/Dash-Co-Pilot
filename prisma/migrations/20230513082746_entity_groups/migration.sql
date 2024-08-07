/*
  Warnings:

  - You are about to drop the column `input` on the `EntityRelationship` table. All the data in the column will be lost.
  - You are about to drop the column `multiple` on the `EntityRelationship` table. All the data in the column will be lost.
  - You are about to drop the column `columns` on the `EntityView` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[parentId,childId,title]` on the table `EntityRelationship` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "EntityRelationship_parentId_childId_key";

-- AlterTable
ALTER TABLE "EntityRelationship" DROP COLUMN "input",
DROP COLUMN "multiple",
ADD COLUMN     "order" INTEGER,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'one-to-many',
ALTER COLUMN "required" SET DEFAULT false;

-- AlterTable
ALTER TABLE "EntityView" DROP COLUMN "columns",
ADD COLUMN     "gridColumns" INTEGER DEFAULT 5,
ADD COLUMN     "gridColumns2xl" INTEGER DEFAULT 6,
ADD COLUMN     "gridColumnsLg" INTEGER DEFAULT 4,
ADD COLUMN     "gridColumnsMd" INTEGER DEFAULT 3,
ADD COLUMN     "gridColumnsSm" INTEGER DEFAULT 2,
ADD COLUMN     "gridColumnsXl" INTEGER DEFAULT 5,
ADD COLUMN     "gridGap" TEXT DEFAULT 'sm';

-- CreateTable
CREATE TABLE "EntityGroup" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "order" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "collapsible" BOOLEAN NOT NULL,
    "section" TEXT,

    CONSTRAINT "EntityGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EntityToEntityGroup" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "EntityGroup_slug_key" ON "EntityGroup"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "_EntityToEntityGroup_AB_unique" ON "_EntityToEntityGroup"("A", "B");

-- CreateIndex
CREATE INDEX "_EntityToEntityGroup_B_index" ON "_EntityToEntityGroup"("B");

-- CreateIndex
CREATE UNIQUE INDEX "EntityRelationship_parentId_childId_title_key" ON "EntityRelationship"("parentId", "childId", "title");

-- AddForeignKey
ALTER TABLE "_EntityToEntityGroup" ADD CONSTRAINT "_EntityToEntityGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EntityToEntityGroup" ADD CONSTRAINT "_EntityToEntityGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "EntityGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
