/*
  Warnings:

  - Added the required column `basePath` to the `KnowledgeBase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "KnowledgeBase" ADD COLUMN     "basePath" TEXT NOT NULL;
