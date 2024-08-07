/*
  Warnings:

  - You are about to drop the column `hasWorkflow` on the `Entity` table. All the data in the column will be lost.
  - You are about to drop the column `groupByWorkflowStates` on the `EntityView` table. All the data in the column will be lost.
  - You are about to drop the column `workflowTransitionId` on the `Log` table. All the data in the column will be lost.
  - You are about to drop the column `isDynamic` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `workflowStateId` on the `Row` table. All the data in the column will be lost.
  - You are about to drop the `EntityWorkflowState` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EntityWorkflowStep` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EntityWorkflowStepAssignee` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RowWorkflowTransition` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EntityWorkflowState" DROP CONSTRAINT "EntityWorkflowState_entityId_fkey";

-- DropForeignKey
ALTER TABLE "EntityWorkflowStep" DROP CONSTRAINT "EntityWorkflowStep_entityId_fkey";

-- DropForeignKey
ALTER TABLE "EntityWorkflowStep" DROP CONSTRAINT "EntityWorkflowStep_fromStateId_fkey";

-- DropForeignKey
ALTER TABLE "EntityWorkflowStep" DROP CONSTRAINT "EntityWorkflowStep_toStateId_fkey";

-- DropForeignKey
ALTER TABLE "EntityWorkflowStepAssignee" DROP CONSTRAINT "EntityWorkflowStepAssignee_groupId_fkey";

-- DropForeignKey
ALTER TABLE "EntityWorkflowStepAssignee" DROP CONSTRAINT "EntityWorkflowStepAssignee_roleId_fkey";

-- DropForeignKey
ALTER TABLE "EntityWorkflowStepAssignee" DROP CONSTRAINT "EntityWorkflowStepAssignee_stepId_fkey";

-- DropForeignKey
ALTER TABLE "EntityWorkflowStepAssignee" DROP CONSTRAINT "EntityWorkflowStepAssignee_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "EntityWorkflowStepAssignee" DROP CONSTRAINT "EntityWorkflowStepAssignee_userId_fkey";

-- DropForeignKey
ALTER TABLE "Log" DROP CONSTRAINT "Log_workflowTransitionId_fkey";

-- DropForeignKey
ALTER TABLE "Row" DROP CONSTRAINT "Row_workflowStateId_fkey";

-- DropForeignKey
ALTER TABLE "RowWorkflowTransition" DROP CONSTRAINT "RowWorkflowTransition_byApiKeyId_fkey";

-- DropForeignKey
ALTER TABLE "RowWorkflowTransition" DROP CONSTRAINT "RowWorkflowTransition_byEmailId_fkey";

-- DropForeignKey
ALTER TABLE "RowWorkflowTransition" DROP CONSTRAINT "RowWorkflowTransition_byEventWebhookAttemptId_fkey";

-- DropForeignKey
ALTER TABLE "RowWorkflowTransition" DROP CONSTRAINT "RowWorkflowTransition_byUserId_fkey";

-- DropForeignKey
ALTER TABLE "RowWorkflowTransition" DROP CONSTRAINT "RowWorkflowTransition_rowId_fkey";

-- DropForeignKey
ALTER TABLE "RowWorkflowTransition" DROP CONSTRAINT "RowWorkflowTransition_workflowStepId_fkey";

-- AlterTable
ALTER TABLE "Entity" DROP COLUMN "hasWorkflow";

-- AlterTable
ALTER TABLE "EntityView" DROP COLUMN "groupByWorkflowStates";

-- AlterTable
ALTER TABLE "Log" DROP COLUMN "workflowTransitionId";

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "isDynamic",
ALTER COLUMN "isDefault" SET DEFAULT false,
ALTER COLUMN "isRequired" SET DEFAULT false,
ALTER COLUMN "isHidden" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Row" DROP COLUMN "workflowStateId";

-- DropTable
DROP TABLE "EntityWorkflowState";

-- DropTable
DROP TABLE "EntityWorkflowStep";

-- DropTable
DROP TABLE "EntityWorkflowStepAssignee";

-- DropTable
DROP TABLE "RowWorkflowTransition";
