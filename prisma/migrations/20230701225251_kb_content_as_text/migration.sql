-- AlterTable
ALTER TABLE "KnowledgeBaseArticle" ADD COLUMN     "contentPublishedAsText" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "contentPublished" SET DEFAULT '';
