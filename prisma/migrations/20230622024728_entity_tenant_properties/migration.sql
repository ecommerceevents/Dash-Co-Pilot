/*
  Warnings:

  - A unique constraint covering the columns `[entityId,name,tenantId]` on the table `Property` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[entityId,title,tenantId]` on the table `Property` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Property_entityId_name_key";

-- DropIndex
DROP INDEX "Property_entityId_title_key";

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "tenantId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Property_entityId_name_tenantId_key" ON "Property"("entityId", "name", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Property_entityId_title_tenantId_key" ON "Property"("entityId", "title", "tenantId");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
