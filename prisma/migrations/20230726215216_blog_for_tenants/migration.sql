/*
  Warnings:

  - A unique constraint covering the columns `[tenantId,name]` on the table `BlogCategory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,slug]` on the table `BlogPost` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "BlogCategory_name_key";

-- DropIndex
DROP INDEX "BlogPost_slug_key";

-- AlterTable
ALTER TABLE "BlogCategory" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "BlogTag" ADD COLUMN     "tenantId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "BlogCategory_tenantId_name_key" ON "BlogCategory"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_tenantId_slug_key" ON "BlogPost"("tenantId", "slug");

-- AddForeignKey
ALTER TABLE "BlogCategory" ADD CONSTRAINT "BlogCategory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogTag" ADD CONSTRAINT "BlogTag_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
