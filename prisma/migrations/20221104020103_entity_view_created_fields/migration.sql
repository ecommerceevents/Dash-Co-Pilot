/*
  Warnings:

  - Added the required column `updatedAt` to the `EntityView` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EntityView" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdByUserId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "EntityViewProperty" ADD COLUMN     "name" TEXT,
ALTER COLUMN "propertyId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "EntityView" ADD CONSTRAINT "EntityView_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
