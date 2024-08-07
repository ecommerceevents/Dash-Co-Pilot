/*
  Warnings:

  - You are about to drop the column `action` on the `FeatureFlag` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FeatureFlag" DROP COLUMN "action";

-- AlterTable
ALTER TABLE "FeatureFlagFilter" ADD COLUMN     "action" TEXT;
