-- AlterTable
ALTER TABLE "Row" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "TenantSettingsRow" (
    "tenantId" TEXT NOT NULL,
    "rowId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "TenantSettingsRow_tenantId_key" ON "TenantSettingsRow"("tenantId");

-- AddForeignKey
ALTER TABLE "TenantSettingsRow" ADD CONSTRAINT "TenantSettingsRow_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantSettingsRow" ADD CONSTRAINT "TenantSettingsRow_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "Row"("id") ON DELETE CASCADE ON UPDATE CASCADE;
