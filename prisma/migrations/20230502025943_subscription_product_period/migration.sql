-- AlterTable
ALTER TABLE "TenantSubscriptionProduct" ADD COLUMN     "currentPeriodEnd" TIMESTAMP(3),
ADD COLUMN     "currentPeriodStart" TIMESTAMP(3);
