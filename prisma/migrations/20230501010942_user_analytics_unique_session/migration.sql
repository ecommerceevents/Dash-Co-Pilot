-- AlterTable
ALTER TABLE "AnalyticsUniqueVisitor" ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "AnalyticsUniqueVisitor" ADD CONSTRAINT "AnalyticsUniqueVisitor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
