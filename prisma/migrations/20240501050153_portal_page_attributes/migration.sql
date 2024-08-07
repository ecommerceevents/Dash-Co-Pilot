/*
  Warnings:

  - You are about to drop the column `content` on the `PortalPage` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `PortalPage` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `PortalPage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PortalPage" DROP COLUMN "content",
DROP COLUMN "description",
DROP COLUMN "title",
ADD COLUMN     "attributes" JSONB;
