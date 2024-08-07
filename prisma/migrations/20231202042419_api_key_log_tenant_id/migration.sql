-- AlterTable
ALTER TABLE "ApiKeyLog" ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "tenantId" TEXT;

-- AddForeignKey
ALTER TABLE "ApiKeyLog" ADD CONSTRAINT "ApiKeyLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
