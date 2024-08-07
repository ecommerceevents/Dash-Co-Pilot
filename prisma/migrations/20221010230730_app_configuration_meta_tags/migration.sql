-- CreateTable
CREATE TABLE "AppConfiguration" (
    "id" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "authRequireEmailVerification" BOOLEAN NOT NULL DEFAULT false,
    "authRequireOrganization" BOOLEAN NOT NULL DEFAULT true,
    "authRequireName" BOOLEAN NOT NULL DEFAULT true,
    "authRecaptchaSiteKey" TEXT,
    "analyticsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "analyticsSimpleAnalytics" BOOLEAN NOT NULL DEFAULT false,
    "analyticsPlausibleAnalytics" BOOLEAN NOT NULL DEFAULT false,
    "analyticsGoogleAnalyticsTrackingId" TEXT,
    "subscriptionRequired" BOOLEAN NOT NULL DEFAULT true,
    "subscriptionAllowSubscribeBeforeSignUp" BOOLEAN NOT NULL DEFAULT true,
    "subscriptionAllowSignUpBeforeSubscribe" BOOLEAN NOT NULL DEFAULT true,
    "cookiesEnabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AppConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppCookie" (
    "id" TEXT NOT NULL,
    "category" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "expiry" TEXT,
    "domain" TEXT,
    "type" TEXT,
    "href" TEXT,

    CONSTRAINT "AppCookie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetaTag" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "MetaTag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MetaTag_path_name_value_key" ON "MetaTag"("path", "name", "value");
