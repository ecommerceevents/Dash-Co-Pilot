-- DropForeignKey
ALTER TABLE "AnalyticsUniqueVisitor" DROP CONSTRAINT "AnalyticsUniqueVisitor_userId_fkey";

-- AddForeignKey
ALTER TABLE "AnalyticsUniqueVisitor" ADD CONSTRAINT "AnalyticsUniqueVisitor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
