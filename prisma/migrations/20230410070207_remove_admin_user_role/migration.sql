/*
  Warnings:

  - You are about to drop the column `role` on the `AdminUser` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AdminUser" DROP COLUMN "role";

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "deactivatedReason" TEXT;

-- CreateTable
CREATE TABLE "TenantIpAddress" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "apiKeyId" TEXT,
    "ip" TEXT NOT NULL,
    "fromUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantIpAddress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TenantIpAddress_tenantId_ip_userId_apiKeyId_key" ON "TenantIpAddress"("tenantId", "ip", "userId", "apiKeyId");

-- AddForeignKey
ALTER TABLE "TenantIpAddress" ADD CONSTRAINT "TenantIpAddress_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantIpAddress" ADD CONSTRAINT "TenantIpAddress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantIpAddress" ADD CONSTRAINT "TenantIpAddress_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "ApiKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
