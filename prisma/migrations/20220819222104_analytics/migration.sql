-- CreateTable
CREATE TABLE "AnalyticsSettings" (
    "id" TEXT NOT NULL,
    "public" BOOLEAN NOT NULL DEFAULT false,
    "ignorePages" TEXT[],
    "onlyPages" TEXT[],

    CONSTRAINT "AnalyticsSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsUniqueVisitor" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cookie" TEXT NOT NULL,
    "httpReferrer" TEXT,
    "browser" TEXT,
    "browserVersion" TEXT,
    "os" TEXT,
    "osVersion" TEXT,
    "device" TEXT,
    "source" TEXT,
    "medium" TEXT,
    "campaign" TEXT,
    "content" TEXT,
    "term" TEXT,
    "country" TEXT,
    "city" TEXT,
    "fromUrl" TEXT,
    "fromRoute" TEXT,

    CONSTRAINT "AnalyticsUniqueVisitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsPageView" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uniqueVisitorId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "route" TEXT,

    CONSTRAINT "AnalyticsPageView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uniqueVisitorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "category" TEXT,
    "label" TEXT,
    "value" TEXT,
    "url" TEXT,
    "route" TEXT,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsUniqueVisitor_cookie_key" ON "AnalyticsUniqueVisitor"("cookie");

-- AddForeignKey
ALTER TABLE "AnalyticsPageView" ADD CONSTRAINT "AnalyticsPageView_uniqueVisitorId_fkey" FOREIGN KEY ("uniqueVisitorId") REFERENCES "AnalyticsUniqueVisitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_uniqueVisitorId_fkey" FOREIGN KEY ("uniqueVisitorId") REFERENCES "AnalyticsUniqueVisitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
