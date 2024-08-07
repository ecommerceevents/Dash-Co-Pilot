/*
  Warnings:

  - You are about to drop the column `appliesToAllTenants` on the `WorkflowBlock` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Workflow" ADD COLUMN     "appliesToAllTenants" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "WorkflowBlock" DROP COLUMN "appliesToAllTenants";
