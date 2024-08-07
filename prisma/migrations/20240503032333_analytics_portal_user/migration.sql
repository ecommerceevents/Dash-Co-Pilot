-- AlterTable
ALTER TABLE "AnalyticsEvent" ADD COLUMN     "portalUserId" TEXT;

-- AlterTable
ALTER TABLE "AnalyticsPageView" ADD COLUMN     "portalUserId" TEXT;

-- AlterTable
ALTER TABLE "AnalyticsUniqueVisitor" ADD COLUMN     "portalUserId" TEXT;

-- AddForeignKey
ALTER TABLE "AnalyticsUniqueVisitor" ADD CONSTRAINT "AnalyticsUniqueVisitor_portalUserId_fkey" FOREIGN KEY ("portalUserId") REFERENCES "PortalUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsPageView" ADD CONSTRAINT "AnalyticsPageView_portalUserId_fkey" FOREIGN KEY ("portalUserId") REFERENCES "PortalUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_portalUserId_fkey" FOREIGN KEY ("portalUserId") REFERENCES "PortalUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
