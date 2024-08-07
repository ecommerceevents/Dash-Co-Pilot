-- AlterTable
ALTER TABLE "Formula" ADD COLUMN     "withLogs" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "FormulaComponent" ADD COLUMN     "value" TEXT;

-- CreateTable
CREATE TABLE "FormulaLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "formulaId" TEXT NOT NULL,
    "userId" TEXT,
    "tenantId" TEXT,
    "originalTrigger" TEXT,
    "triggeredBy" TEXT NOT NULL,
    "expression" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "rowValueId" TEXT,

    CONSTRAINT "FormulaLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormulaComponentLog" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "name" TEXT,
    "operator" TEXT,
    "parenthesis" TEXT,
    "value" TEXT NOT NULL,
    "rowId" TEXT,
    "formulaLogId" TEXT NOT NULL,

    CONSTRAINT "FormulaComponentLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FormulaLog" ADD CONSTRAINT "FormulaLog_formulaId_fkey" FOREIGN KEY ("formulaId") REFERENCES "Formula"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulaLog" ADD CONSTRAINT "FormulaLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulaLog" ADD CONSTRAINT "FormulaLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulaComponentLog" ADD CONSTRAINT "FormulaComponentLog_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "Row"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulaComponentLog" ADD CONSTRAINT "FormulaComponentLog_formulaLogId_fkey" FOREIGN KEY ("formulaLogId") REFERENCES "FormulaLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
