/*
  Warnings:

  - You are about to drop the column `canComment` on the `Row` table. All the data in the column will be lost.
  - You are about to drop the column `canDelete` on the `Row` table. All the data in the column will be lost.
  - You are about to drop the column `canUpdate` on the `Row` table. All the data in the column will be lost.
  - You are about to drop the column `visibility` on the `Row` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EntityTag" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Row" DROP COLUMN "canComment",
DROP COLUMN "canDelete",
DROP COLUMN "canUpdate",
DROP COLUMN "visibility";

-- AlterTable
ALTER TABLE "RowPermission" ADD COLUMN     "access" TEXT NOT NULL DEFAULT 'view',
ADD COLUMN     "public" BOOLEAN;

-- AlterTable
ALTER TABLE "RowTag" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
