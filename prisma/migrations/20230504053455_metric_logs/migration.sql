-- CreateTable
CREATE TABLE "MetricLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "env" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "function" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "userId" TEXT,
    "tenantId" TEXT,

    CONSTRAINT "MetricLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MetricLog" ADD CONSTRAINT "MetricLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetricLog" ADD CONSTRAINT "MetricLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
