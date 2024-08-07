/*
  Warnings:

  - You are about to drop the column `path` on the `PageBlock` table. All the data in the column will be lost.
  - You are about to drop the `MetaTag` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `pageId` to the `PageBlock` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PageBlock" DROP COLUMN "path",
ADD COLUMN     "pageId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SubscriptionFeature" ADD COLUMN     "href" TEXT;

-- AlterTable
ALTER TABLE "SubscriptionProduct" ADD COLUMN     "groupDescription" TEXT,
ADD COLUMN     "groupTitle" TEXT;

-- DropTable
DROP TABLE "MetaTag";

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageMetaTag" (
    "id" TEXT NOT NULL,
    "pageId" TEXT,
    "order" INTEGER,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "PageMetaTag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PageMetaTag_pageId_name_value_key" ON "PageMetaTag"("pageId", "name", "value");

-- AddForeignKey
ALTER TABLE "PageMetaTag" ADD CONSTRAINT "PageMetaTag_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageBlock" ADD CONSTRAINT "PageBlock_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
