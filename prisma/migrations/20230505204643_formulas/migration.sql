/*
  Warnings:

  - You are about to drop the column `formula` on the `Property` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AppConfiguration" ADD COLUMN     "metricsEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "metricsIgnoreUrls" TEXT,
ADD COLUMN     "metricsLogToConsole" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "metricsSaveToDatabase" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "formula",
ADD COLUMN     "formulaId" TEXT;

-- CreateTable
CREATE TABLE "Formula" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "resultAs" TEXT NOT NULL,
    "calculationTrigger" TEXT NOT NULL,

    CONSTRAINT "Formula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormulaComponent" (
    "id" TEXT NOT NULL,
    "formulaId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "name" TEXT,
    "operator" TEXT,
    "parenthesis" TEXT,

    CONSTRAINT "FormulaComponent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_formulaId_fkey" FOREIGN KEY ("formulaId") REFERENCES "Formula"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulaComponent" ADD CONSTRAINT "FormulaComponent_formulaId_fkey" FOREIGN KEY ("formulaId") REFERENCES "Formula"("id") ON DELETE CASCADE ON UPDATE CASCADE;
