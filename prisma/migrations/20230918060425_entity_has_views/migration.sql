-- AlterTable
ALTER TABLE "Entity" ADD COLUMN     "hasViews" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "PromptFlow" ADD COLUMN     "public" BOOLEAN NOT NULL DEFAULT true;
