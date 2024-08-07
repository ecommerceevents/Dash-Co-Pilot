-- AlterTable
ALTER TABLE "ApiKeyLog" ADD COLUMN     "type" TEXT;

-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "SubscriptionProduct" ADD COLUMN     "canBuyAgain" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasQuantity" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "IpAddressLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "error" TEXT,
    "metadata" TEXT,
    "ipAddressId" TEXT,

    CONSTRAINT "IpAddressLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Credit" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "amount" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "objectId" TEXT,

    CONSTRAINT "Credit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT,
    "userId" TEXT,
    "message" TEXT NOT NULL,
    "fromUrl" TEXT NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Credit_tenantId_userId_idx" ON "Credit"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "Credit_tenantId_createdAt_idx" ON "Credit"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "api_key_log_tenant_type" ON "ApiKeyLog"("tenantId", "type");

-- AddForeignKey
ALTER TABLE "IpAddressLog" ADD CONSTRAINT "IpAddressLog_ipAddressId_fkey" FOREIGN KEY ("ipAddressId") REFERENCES "IpAddress"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credit" ADD CONSTRAINT "Credit_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credit" ADD CONSTRAINT "Credit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
