/*
  Warnings:

  - You are about to drop the `BlogAuthor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BlogPost" DROP CONSTRAINT "BlogPost_authorId_fkey";

-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "contentType" TEXT NOT NULL DEFAULT 'markdown',
ALTER COLUMN "authorId" DROP NOT NULL,
ALTER COLUMN "categoryId" DROP NOT NULL;

-- DropTable
DROP TABLE "BlogAuthor";

-- CreateTable
CREATE TABLE "KnowledgeBase" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "defaultLanguage" TEXT NOT NULL,
    "layout" TEXT NOT NULL,
    "color" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "languages" TEXT NOT NULL,
    "links" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "seoImage" TEXT NOT NULL,

    CONSTRAINT "KnowledgeBase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeBaseCategory" (
    "id" TEXT NOT NULL,
    "knowledgeBaseId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "seoImage" TEXT NOT NULL,

    CONSTRAINT "KnowledgeBaseCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeBaseCategorySection" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "KnowledgeBaseCategorySection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeBaseArticle" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "knowledgeBaseId" TEXT NOT NULL,
    "categoryId" TEXT,
    "sectionId" TEXT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "contentDraft" TEXT NOT NULL,
    "contentPublished" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "featuredOrder" INTEGER,
    "seoImage" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "relatedInArticleId" TEXT,
    "createdByUserId" TEXT,

    CONSTRAINT "KnowledgeBaseArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeBaseRelatedArticle" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "relatedArticleId" TEXT NOT NULL,

    CONSTRAINT "KnowledgeBaseRelatedArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeBaseViews" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "knowledgeBaseId" TEXT NOT NULL,
    "userAnalyticsId" TEXT NOT NULL,

    CONSTRAINT "KnowledgeBaseViews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeBaseArticleViews" (
    "knowledgeBaseArticleId" TEXT NOT NULL,
    "userAnalyticsId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "KnowledgeBaseArticleUpvotes" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "knowledgeBaseArticleId" TEXT NOT NULL,
    "userAnalyticsId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "KnowledgeBaseArticleDownvotes" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "knowledgeBaseArticleId" TEXT NOT NULL,
    "userAnalyticsId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeBase_slug_key" ON "KnowledgeBase"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeBaseCategory_knowledgeBaseId_slug_key" ON "KnowledgeBaseCategory"("knowledgeBaseId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeBaseArticle_knowledgeBaseId_slug_key" ON "KnowledgeBaseArticle"("knowledgeBaseId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeBaseViews_knowledgeBaseId_userAnalyticsId_key" ON "KnowledgeBaseViews"("knowledgeBaseId", "userAnalyticsId");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeBaseArticleViews_knowledgeBaseArticleId_userAnalyt_key" ON "KnowledgeBaseArticleViews"("knowledgeBaseArticleId", "userAnalyticsId");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeBaseArticleUpvotes_knowledgeBaseArticleId_userAnal_key" ON "KnowledgeBaseArticleUpvotes"("knowledgeBaseArticleId", "userAnalyticsId");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeBaseArticleDownvotes_knowledgeBaseArticleId_userAn_key" ON "KnowledgeBaseArticleDownvotes"("knowledgeBaseArticleId", "userAnalyticsId");

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeBaseCategory" ADD CONSTRAINT "KnowledgeBaseCategory_knowledgeBaseId_fkey" FOREIGN KEY ("knowledgeBaseId") REFERENCES "KnowledgeBase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeBaseCategorySection" ADD CONSTRAINT "KnowledgeBaseCategorySection_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "KnowledgeBaseCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeBaseArticle" ADD CONSTRAINT "KnowledgeBaseArticle_knowledgeBaseId_fkey" FOREIGN KEY ("knowledgeBaseId") REFERENCES "KnowledgeBase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeBaseArticle" ADD CONSTRAINT "KnowledgeBaseArticle_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "KnowledgeBaseCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeBaseArticle" ADD CONSTRAINT "KnowledgeBaseArticle_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "KnowledgeBaseCategorySection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeBaseArticle" ADD CONSTRAINT "KnowledgeBaseArticle_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeBaseRelatedArticle" ADD CONSTRAINT "KnowledgeBaseRelatedArticle_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "KnowledgeBaseArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeBaseRelatedArticle" ADD CONSTRAINT "KnowledgeBaseRelatedArticle_relatedArticleId_fkey" FOREIGN KEY ("relatedArticleId") REFERENCES "KnowledgeBaseArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeBaseViews" ADD CONSTRAINT "KnowledgeBaseViews_knowledgeBaseId_fkey" FOREIGN KEY ("knowledgeBaseId") REFERENCES "KnowledgeBase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeBaseArticleViews" ADD CONSTRAINT "KnowledgeBaseArticleViews_knowledgeBaseArticleId_fkey" FOREIGN KEY ("knowledgeBaseArticleId") REFERENCES "KnowledgeBaseArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeBaseArticleUpvotes" ADD CONSTRAINT "KnowledgeBaseArticleUpvotes_knowledgeBaseArticleId_fkey" FOREIGN KEY ("knowledgeBaseArticleId") REFERENCES "KnowledgeBaseArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeBaseArticleDownvotes" ADD CONSTRAINT "KnowledgeBaseArticleDownvotes_knowledgeBaseArticleId_fkey" FOREIGN KEY ("knowledgeBaseArticleId") REFERENCES "KnowledgeBaseArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
