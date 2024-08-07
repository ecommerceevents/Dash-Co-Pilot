/*
  Warnings:

  - You are about to drop the column `name` on the `FormulaComponent` table. All the data in the column will be lost.
  - You are about to drop the column `operator` on the `FormulaComponent` table. All the data in the column will be lost.
  - You are about to drop the column `parenthesis` on the `FormulaComponent` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `FormulaComponentLog` table. All the data in the column will be lost.
  - You are about to drop the column `operator` on the `FormulaComponentLog` table. All the data in the column will be lost.
  - You are about to drop the column `parenthesis` on the `FormulaComponentLog` table. All the data in the column will be lost.
  - Added the required column `type` to the `FormulaComponent` table without a default value. This is not possible if the table is not empty.
  - Made the column `value` on table `FormulaComponent` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `type` to the `FormulaComponentLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FormulaComponent" DROP COLUMN "name",
DROP COLUMN "operator",
DROP COLUMN "parenthesis",
ADD COLUMN     "type" TEXT NOT NULL,
ALTER COLUMN "value" SET NOT NULL;

-- AlterTable
ALTER TABLE "FormulaComponentLog" DROP COLUMN "name",
DROP COLUMN "operator",
DROP COLUMN "parenthesis",
ADD COLUMN     "type" TEXT NOT NULL;
