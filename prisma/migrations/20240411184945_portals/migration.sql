-- AlterTable
ALTER TABLE "AnalyticsEvent" ADD COLUMN     "portalId" TEXT;

-- AlterTable
ALTER TABLE "AnalyticsPageView" ADD COLUMN     "portalId" TEXT;

-- AlterTable
ALTER TABLE "AnalyticsUniqueVisitor" ADD COLUMN     "portalId" TEXT;

-- CreateTable
CREATE TABLE "Portal" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT,
    "createdByUserId" TEXT,
    "subdomain" TEXT NOT NULL,
    "domain" TEXT,
    "title" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "stripeAccountId" TEXT,
    "themeColor" TEXT,
    "themeScheme" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoImage" TEXT,
    "seoThumbnail" TEXT,
    "seoTwitterCreator" TEXT,
    "seoTwitterSite" TEXT,
    "seoKeywords" TEXT,
    "authRequireEmailVerification" BOOLEAN NOT NULL DEFAULT false,
    "authRequireOrganization" BOOLEAN NOT NULL DEFAULT true,
    "authRequireName" BOOLEAN NOT NULL DEFAULT true,
    "analyticsSimpleAnalytics" BOOLEAN NOT NULL DEFAULT false,
    "analyticsPlausibleAnalytics" BOOLEAN NOT NULL DEFAULT false,
    "analyticsGoogleAnalyticsTrackingId" TEXT,
    "brandingLogo" TEXT,
    "brandingLogoDarkMode" TEXT,
    "brandingIcon" TEXT,
    "brandingIconDarkMode" TEXT,
    "brandingFavicon" TEXT,
    "affiliatesRewardfulApiKey" TEXT,
    "affiliatesRewardfulUrl" TEXT,
    "metadata" JSONB,

    CONSTRAINT "Portal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalUser" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT,
    "portalId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "avatar" TEXT,
    "phone" TEXT,
    "verifyToken" TEXT,
    "githubId" TEXT,
    "googleId" TEXT,
    "locale" TEXT,

    CONSTRAINT "PortalUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalPage" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "portalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "PortalPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalUserRegistration" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "portalId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "slug" TEXT,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT,
    "company" TEXT,
    "selectedSubscriptionPriceId" TEXT,
    "createdPortalUserId" TEXT,

    CONSTRAINT "PortalUserRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalSubscriptionProduct" (
    "id" TEXT NOT NULL,
    "portalId" TEXT NOT NULL,
    "stripeId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "model" INTEGER NOT NULL,
    "public" BOOLEAN NOT NULL,
    "groupTitle" TEXT,
    "groupDescription" TEXT,
    "description" TEXT,
    "badge" TEXT,
    "billingAddressCollection" TEXT NOT NULL DEFAULT 'auto',
    "hasQuantity" BOOLEAN NOT NULL DEFAULT false,
    "canBuyAgain" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PortalSubscriptionProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalSubscriptionPrice" (
    "id" TEXT NOT NULL,
    "portalId" TEXT NOT NULL,
    "subscriptionProductId" TEXT NOT NULL,
    "stripeId" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "billingPeriod" INTEGER NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL,
    "trialDays" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL,

    CONSTRAINT "PortalSubscriptionPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalSubscriptionFeature" (
    "id" TEXT NOT NULL,
    "portalId" TEXT NOT NULL,
    "subscriptionProductId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,
    "href" TEXT,
    "badge" TEXT,
    "accumulate" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PortalSubscriptionFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalUserSubscription" (
    "id" TEXT NOT NULL,
    "portalId" TEXT NOT NULL,
    "portalUserId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,

    CONSTRAINT "PortalUserSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalUserSubscriptionProduct" (
    "id" TEXT NOT NULL,
    "portalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "portalUserSubscriptionId" TEXT NOT NULL,
    "subscriptionProductId" TEXT NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "stripeSubscriptionId" TEXT,
    "quantity" INTEGER,
    "fromCheckoutSessionId" TEXT,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),

    CONSTRAINT "PortalUserSubscriptionProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalUserSubscriptionProductPrice" (
    "id" TEXT NOT NULL,
    "portalId" TEXT NOT NULL,
    "portalUserSubscriptionProductId" TEXT NOT NULL,
    "subscriptionPriceId" TEXT,

    CONSTRAINT "PortalUserSubscriptionProductPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalCheckoutSessionStatus" (
    "id" TEXT NOT NULL,
    "portalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pending" BOOLEAN NOT NULL DEFAULT true,
    "email" TEXT NOT NULL,
    "fromUrl" TEXT NOT NULL,
    "fromUserId" TEXT,
    "createdUserId" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Portal_subdomain_key" ON "Portal"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "Portal_domain_key" ON "Portal"("domain");

-- CreateIndex
CREATE INDEX "PortalUser_portalId_idx" ON "PortalUser"("portalId");

-- CreateIndex
CREATE UNIQUE INDEX "PortalUser_portalId_email_key" ON "PortalUser"("portalId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "PortalUser_portalId_githubId_key" ON "PortalUser"("portalId", "githubId");

-- CreateIndex
CREATE UNIQUE INDEX "PortalUser_portalId_googleId_key" ON "PortalUser"("portalId", "googleId");

-- CreateIndex
CREATE UNIQUE INDEX "PortalPage_portalId_name_key" ON "PortalPage"("portalId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "PortalUserRegistration_token_key" ON "PortalUserRegistration"("token");

-- CreateIndex
CREATE UNIQUE INDEX "PortalUserRegistration_createdPortalUserId_key" ON "PortalUserRegistration"("createdPortalUserId");

-- CreateIndex
CREATE UNIQUE INDEX "PortalUserRegistration_portalId_email_key" ON "PortalUserRegistration"("portalId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "PortalUserSubscription_portalUserId_key" ON "PortalUserSubscription"("portalUserId");

-- CreateIndex
CREATE UNIQUE INDEX "PortalCheckoutSessionStatus_id_key" ON "PortalCheckoutSessionStatus"("id");

-- AddForeignKey
ALTER TABLE "AnalyticsUniqueVisitor" ADD CONSTRAINT "AnalyticsUniqueVisitor_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "Portal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsPageView" ADD CONSTRAINT "AnalyticsPageView_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "Portal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "Portal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Portal" ADD CONSTRAINT "Portal_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Portal" ADD CONSTRAINT "Portal_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalUser" ADD CONSTRAINT "PortalUser_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalUser" ADD CONSTRAINT "PortalUser_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "Portal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalPage" ADD CONSTRAINT "PortalPage_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "Portal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalUserRegistration" ADD CONSTRAINT "PortalUserRegistration_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "Portal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalUserRegistration" ADD CONSTRAINT "PortalUserRegistration_createdPortalUserId_fkey" FOREIGN KEY ("createdPortalUserId") REFERENCES "PortalUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalSubscriptionProduct" ADD CONSTRAINT "PortalSubscriptionProduct_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "Portal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalSubscriptionPrice" ADD CONSTRAINT "PortalSubscriptionPrice_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "Portal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalSubscriptionPrice" ADD CONSTRAINT "PortalSubscriptionPrice_subscriptionProductId_fkey" FOREIGN KEY ("subscriptionProductId") REFERENCES "PortalSubscriptionProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalSubscriptionFeature" ADD CONSTRAINT "PortalSubscriptionFeature_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "Portal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalSubscriptionFeature" ADD CONSTRAINT "PortalSubscriptionFeature_subscriptionProductId_fkey" FOREIGN KEY ("subscriptionProductId") REFERENCES "PortalSubscriptionProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalUserSubscription" ADD CONSTRAINT "PortalUserSubscription_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "Portal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalUserSubscription" ADD CONSTRAINT "PortalUserSubscription_portalUserId_fkey" FOREIGN KEY ("portalUserId") REFERENCES "PortalUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalUserSubscriptionProduct" ADD CONSTRAINT "PortalUserSubscriptionProduct_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "Portal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalUserSubscriptionProduct" ADD CONSTRAINT "PortalUserSubscriptionProduct_portalUserSubscriptionId_fkey" FOREIGN KEY ("portalUserSubscriptionId") REFERENCES "PortalUserSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalUserSubscriptionProduct" ADD CONSTRAINT "PortalUserSubscriptionProduct_subscriptionProductId_fkey" FOREIGN KEY ("subscriptionProductId") REFERENCES "PortalSubscriptionProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalUserSubscriptionProductPrice" ADD CONSTRAINT "PortalUserSubscriptionProductPrice_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "Portal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalUserSubscriptionProductPrice" ADD CONSTRAINT "PortalUserSubscriptionProductPrice_portalUserSubscriptionP_fkey" FOREIGN KEY ("portalUserSubscriptionProductId") REFERENCES "PortalUserSubscriptionProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalUserSubscriptionProductPrice" ADD CONSTRAINT "PortalUserSubscriptionProductPrice_subscriptionPriceId_fkey" FOREIGN KEY ("subscriptionPriceId") REFERENCES "PortalSubscriptionPrice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalCheckoutSessionStatus" ADD CONSTRAINT "PortalCheckoutSessionStatus_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "Portal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
