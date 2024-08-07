-- AlterTable
ALTER TABLE "Entity" ADD COLUMN     "hasBulkDelete" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "EntityRelationship" ADD COLUMN     "hiddenIfEmpty" BOOLEAN NOT NULL DEFAULT false;
