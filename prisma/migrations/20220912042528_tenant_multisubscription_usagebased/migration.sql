/*
  Warnings:

  - You are about to drop the column `quantity` on the `TenantSubscription` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubscriptionId` on the `TenantSubscription` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionPriceId` on the `TenantSubscription` table. All the data in the column will be lost.
  - The required column `id` was added to the `TenantSubscription` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "TenantSubscription" DROP CONSTRAINT "TenantSubscription_subscriptionPriceId_fkey";

-- AlterTable
ALTER TABLE "AnalyticsSettings" ALTER COLUMN "ignorePages" SET NOT NULL,
ALTER COLUMN "ignorePages" SET DATA TYPE TEXT,
ALTER COLUMN "onlyPages" SET NOT NULL,
ALTER COLUMN "onlyPages" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "SubscriptionPrice" ALTER COLUMN "price" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "TenantSubscription" DROP COLUMN "quantity",
DROP COLUMN "stripeSubscriptionId",
DROP COLUMN "subscriptionPriceId",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "TenantSubscription_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "TenantSubscriptionProduct" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantSubscriptionId" TEXT NOT NULL,
    "subscriptionProductId" TEXT NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "stripeSubscriptionId" TEXT,
    "quantity" INTEGER,
    "fromCheckoutSessionId" TEXT,

    CONSTRAINT "TenantSubscriptionProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantSubscriptionProductPrice" (
    "id" TEXT NOT NULL,
    "tenantSubscriptionProductId" TEXT NOT NULL,
    "subscriptionPriceId" TEXT,
    "subscriptionUsageBasedPriceId" TEXT,

    CONSTRAINT "TenantSubscriptionProductPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantSubscriptionUsageRecord" (
    "id" TEXT NOT NULL,
    "tenantSubscriptionProductPriceId" TEXT NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "stripeSubscriptionItemId" TEXT,

    CONSTRAINT "TenantSubscriptionUsageRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckoutSessionStatus" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "id" TEXT NOT NULL,
    "pending" BOOLEAN NOT NULL DEFAULT true,
    "email" TEXT NOT NULL,
    "fromUrl" TEXT NOT NULL,
    "fromUserId" TEXT,
    "fromTenantId" TEXT,
    "createdUserId" TEXT,
    "createdTenantId" TEXT
);

-- CreateTable
CREATE TABLE "SubscriptionUsageBasedPrice" (
    "id" TEXT NOT NULL,
    "subscriptionProductId" TEXT NOT NULL,
    "stripeId" TEXT NOT NULL,
    "billingPeriod" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "unitTitle" TEXT NOT NULL,
    "unitTitlePlural" TEXT NOT NULL,
    "usageType" TEXT NOT NULL,
    "aggregateUsage" TEXT NOT NULL,
    "tiersMode" TEXT NOT NULL,
    "billingScheme" TEXT NOT NULL,

    CONSTRAINT "SubscriptionUsageBasedPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionUsageBasedTier" (
    "id" TEXT NOT NULL,
    "subscriptionUsageBasedPriceId" TEXT NOT NULL,
    "from" INTEGER NOT NULL,
    "to" INTEGER,
    "perUnitPrice" DECIMAL(65,30),
    "flatFeePrice" DECIMAL(65,30),

    CONSTRAINT "SubscriptionUsageBasedTier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CheckoutSessionStatus_id_key" ON "CheckoutSessionStatus"("id");

-- AddForeignKey
ALTER TABLE "TenantSubscriptionProduct" ADD CONSTRAINT "TenantSubscriptionProduct_tenantSubscriptionId_fkey" FOREIGN KEY ("tenantSubscriptionId") REFERENCES "TenantSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantSubscriptionProduct" ADD CONSTRAINT "TenantSubscriptionProduct_subscriptionProductId_fkey" FOREIGN KEY ("subscriptionProductId") REFERENCES "SubscriptionProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantSubscriptionProductPrice" ADD CONSTRAINT "TenantSubscriptionProductPrice_tenantSubscriptionProductId_fkey" FOREIGN KEY ("tenantSubscriptionProductId") REFERENCES "TenantSubscriptionProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantSubscriptionProductPrice" ADD CONSTRAINT "TenantSubscriptionProductPrice_subscriptionPriceId_fkey" FOREIGN KEY ("subscriptionPriceId") REFERENCES "SubscriptionPrice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantSubscriptionProductPrice" ADD CONSTRAINT "TenantSubscriptionProductPrice_subscriptionUsageBasedPrice_fkey" FOREIGN KEY ("subscriptionUsageBasedPriceId") REFERENCES "SubscriptionUsageBasedPrice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantSubscriptionUsageRecord" ADD CONSTRAINT "TenantSubscriptionUsageRecord_tenantSubscriptionProductPri_fkey" FOREIGN KEY ("tenantSubscriptionProductPriceId") REFERENCES "TenantSubscriptionProductPrice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionUsageBasedPrice" ADD CONSTRAINT "SubscriptionUsageBasedPrice_subscriptionProductId_fkey" FOREIGN KEY ("subscriptionProductId") REFERENCES "SubscriptionProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionUsageBasedTier" ADD CONSTRAINT "SubscriptionUsageBasedTier_subscriptionUsageBasedPriceId_fkey" FOREIGN KEY ("subscriptionUsageBasedPriceId") REFERENCES "SubscriptionUsageBasedPrice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
