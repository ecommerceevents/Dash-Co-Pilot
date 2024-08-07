/*
  Warnings:

  - You are about to drop the `RowValueSelection` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RowValueSelection" DROP CONSTRAINT "RowValueSelection_propertyOptionId_fkey";

-- DropForeignKey
ALTER TABLE "RowValueSelection" DROP CONSTRAINT "RowValueSelection_rowValueId_fkey";

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "subtype" TEXT;

-- DropTable
DROP TABLE "RowValueSelection";

-- CreateTable
CREATE TABLE "RowValueMultiple" (
    "id" TEXT NOT NULL,
    "rowValueId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "RowValueMultiple_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RowValueRange" (
    "rowValueId" TEXT NOT NULL,
    "numberMin" DECIMAL(65,30),
    "numberMax" DECIMAL(65,30),
    "dateMin" TIMESTAMP(3),
    "dateMax" TIMESTAMP(3)
);

-- CreateIndex
CREATE UNIQUE INDEX "RowValueRange_rowValueId_key" ON "RowValueRange"("rowValueId");

-- AddForeignKey
ALTER TABLE "RowValueMultiple" ADD CONSTRAINT "RowValueMultiple_rowValueId_fkey" FOREIGN KEY ("rowValueId") REFERENCES "RowValue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RowValueRange" ADD CONSTRAINT "RowValueRange_rowValueId_fkey" FOREIGN KEY ("rowValueId") REFERENCES "RowValue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
