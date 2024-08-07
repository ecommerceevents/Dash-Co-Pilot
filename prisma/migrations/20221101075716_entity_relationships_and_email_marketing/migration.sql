/*
  Warnings:

  - You are about to drop the column `isDefault` on the `Entity` table. All the data in the column will be lost.
  - You are about to drop the column `isFeature` on the `Entity` table. All the data in the column will be lost.
  - You are about to drop the column `requiresLinkedAccounts` on the `Entity` table. All the data in the column will be lost.
  - You are about to drop the column `isDetail` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `parentId` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `parentId` on the `PropertyOption` table. All the data in the column will be lost.
  - You are about to drop the column `contactId` on the `Row` table. All the data in the column will be lost.
  - You are about to drop the column `contractId` on the `Row` table. All the data in the column will be lost.
  - You are about to drop the column `dealId` on the `Row` table. All the data in the column will be lost.
  - You are about to drop the column `linkedAccountId` on the `Row` table. All the data in the column will be lost.
  - You are about to drop the column `parentRowId` on the `Row` table. All the data in the column will be lost.
  - You are about to drop the column `idValue` on the `RowValue` table. All the data in the column will be lost.
  - You are about to drop the column `relatedRowId` on the `RowValue` table. All the data in the column will be lost.
  - You are about to drop the `Contact` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Contract` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ContractActivity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ContractEmployee` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ContractMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Deal` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_rowId_fkey";

-- DropForeignKey
ALTER TABLE "Contract" DROP CONSTRAINT "Contract_rowId_fkey";

-- DropForeignKey
ALTER TABLE "ContractActivity" DROP CONSTRAINT "ContractActivity_contractId_fkey";

-- DropForeignKey
ALTER TABLE "ContractActivity" DROP CONSTRAINT "ContractActivity_createdByUserId_fkey";

-- DropForeignKey
ALTER TABLE "ContractEmployee" DROP CONSTRAINT "ContractEmployee_contractId_fkey";

-- DropForeignKey
ALTER TABLE "ContractEmployee" DROP CONSTRAINT "ContractEmployee_rowId_fkey";

-- DropForeignKey
ALTER TABLE "ContractMember" DROP CONSTRAINT "ContractMember_contractId_fkey";

-- DropForeignKey
ALTER TABLE "ContractMember" DROP CONSTRAINT "ContractMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "Deal" DROP CONSTRAINT "Deal_contactId_fkey";

-- DropForeignKey
ALTER TABLE "Deal" DROP CONSTRAINT "Deal_rowId_fkey";

-- DropForeignKey
ALTER TABLE "Deal" DROP CONSTRAINT "Deal_subscriptionPriceId_fkey";

-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_parentId_fkey";

-- DropForeignKey
ALTER TABLE "PropertyOption" DROP CONSTRAINT "PropertyOption_parentId_fkey";

-- DropForeignKey
ALTER TABLE "Row" DROP CONSTRAINT "Row_createdByApiKeyId_fkey";

-- DropForeignKey
ALTER TABLE "Row" DROP CONSTRAINT "Row_createdByUserId_fkey";

-- DropForeignKey
ALTER TABLE "Row" DROP CONSTRAINT "Row_entityId_fkey";

-- DropForeignKey
ALTER TABLE "Row" DROP CONSTRAINT "Row_linkedAccountId_fkey";

-- DropForeignKey
ALTER TABLE "Row" DROP CONSTRAINT "Row_parentRowId_fkey";

-- DropForeignKey
ALTER TABLE "Row" DROP CONSTRAINT "Row_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Row" DROP CONSTRAINT "Row_workflowStateId_fkey";

-- DropForeignKey
ALTER TABLE "RowValue" DROP CONSTRAINT "RowValue_relatedRowId_fkey";

-- DropIndex
DROP INDEX "Entity_order_key";

-- DropIndex
DROP INDEX "EntityView_entityId_name_key";

-- DropIndex
DROP INDEX "EntityView_entityId_order_key";

-- AlterTable
ALTER TABLE "Entity" DROP COLUMN "isDefault",
DROP COLUMN "isFeature",
DROP COLUMN "requiresLinkedAccounts",
ADD COLUMN     "moduleId" TEXT,
ADD COLUMN     "showInSidebar" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'app';

-- AlterTable
ALTER TABLE "EntityView" ADD COLUMN     "tenantId" TEXT,
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "EntityViewFilter" ADD COLUMN     "match" TEXT NOT NULL DEFAULT 'and';

-- AlterTable
ALTER TABLE "EntityWorkflowState" ADD COLUMN     "progress" INTEGER;

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "isDetail",
DROP COLUMN "parentId",
ADD COLUMN     "isDisplay" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isUnique" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "PropertyOption" DROP COLUMN "parentId";

-- AlterTable
ALTER TABLE "Row" DROP COLUMN "contactId",
DROP COLUMN "contractId",
DROP COLUMN "dealId",
DROP COLUMN "linkedAccountId",
DROP COLUMN "parentRowId";

-- AlterTable
ALTER TABLE "RowValue" DROP COLUMN "idValue",
DROP COLUMN "relatedRowId";

-- DropTable
DROP TABLE "Contact";

-- DropTable
DROP TABLE "Contract";

-- DropTable
DROP TABLE "ContractActivity";

-- DropTable
DROP TABLE "ContractEmployee";

-- DropTable
DROP TABLE "ContractMember";

-- DropTable
DROP TABLE "Deal";

-- CreateTable
CREATE TABLE "Module" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'app',
    "order" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntityRelationship" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "multiple" BOOLEAN NOT NULL,
    "required" BOOLEAN NOT NULL,

    CONSTRAINT "EntityRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SampleCustomEntity" (
    "rowId" TEXT NOT NULL,
    "customText" TEXT NOT NULL,
    "customNumber" DECIMAL(65,30) NOT NULL,
    "customDate" TIMESTAMP(3) NOT NULL,
    "customBoolean" BOOLEAN NOT NULL,
    "customSelect" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "RowRelationship" (
    "id" TEXT NOT NULL,
    "relationshipId" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,

    CONSTRAINT "RowRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RowValueSelection" (
    "id" TEXT NOT NULL,
    "rowValueId" TEXT NOT NULL,
    "propertyOptionId" TEXT NOT NULL,

    CONSTRAINT "RowValueSelection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailSender" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "provider" TEXT NOT NULL,
    "stream" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "fromEmail" TEXT NOT NULL,
    "fromName" TEXT,
    "replyToEmail" TEXT,

    CONSTRAINT "EmailSender_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "emailSenderId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "htmlBody" TEXT NOT NULL,
    "textBody" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "track" BOOLEAN NOT NULL,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutboundEmail" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT,
    "campaignId" TEXT,
    "contactRowId" TEXT,
    "email" TEXT NOT NULL,
    "fromSenderId" TEXT NOT NULL,
    "isPreview" BOOLEAN,
    "error" TEXT,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "bouncedAt" TIMESTAMP(3),
    "spamComplainedAt" TIMESTAMP(3),
    "unsubscribedAt" TIMESTAMP(3),

    CONSTRAINT "OutboundEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutboundEmailOpen" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firstOpen" BOOLEAN NOT NULL,
    "outboundEmailId" TEXT NOT NULL,

    CONSTRAINT "OutboundEmailOpen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutboundEmailClick" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "link" TEXT NOT NULL,
    "outboundEmailId" TEXT NOT NULL,

    CONSTRAINT "OutboundEmailClick_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Module_name_key" ON "Module"("name");

-- CreateIndex
CREATE UNIQUE INDEX "EntityRelationship_parentId_childId_key" ON "EntityRelationship"("parentId", "childId");

-- CreateIndex
CREATE UNIQUE INDEX "SampleCustomEntity_rowId_key" ON "SampleCustomEntity"("rowId");

-- CreateIndex
CREATE UNIQUE INDEX "RowRelationship_parentId_childId_key" ON "RowRelationship"("parentId", "childId");

-- AddForeignKey
ALTER TABLE "Entity" ADD CONSTRAINT "Entity_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityView" ADD CONSTRAINT "EntityView_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityView" ADD CONSTRAINT "EntityView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityRelationship" ADD CONSTRAINT "EntityRelationship_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityRelationship" ADD CONSTRAINT "EntityRelationship_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleCustomEntity" ADD CONSTRAINT "SampleCustomEntity_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "Row"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RowRelationship" ADD CONSTRAINT "RowRelationship_relationshipId_fkey" FOREIGN KEY ("relationshipId") REFERENCES "EntityRelationship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RowRelationship" ADD CONSTRAINT "RowRelationship_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Row"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RowRelationship" ADD CONSTRAINT "RowRelationship_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Row"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Row" ADD CONSTRAINT "Row_createdByApiKeyId_fkey" FOREIGN KEY ("createdByApiKeyId") REFERENCES "ApiKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Row" ADD CONSTRAINT "Row_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Row" ADD CONSTRAINT "Row_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Row" ADD CONSTRAINT "Row_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Row" ADD CONSTRAINT "Row_workflowStateId_fkey" FOREIGN KEY ("workflowStateId") REFERENCES "EntityWorkflowState"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RowValueSelection" ADD CONSTRAINT "RowValueSelection_propertyOptionId_fkey" FOREIGN KEY ("propertyOptionId") REFERENCES "PropertyOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RowValueSelection" ADD CONSTRAINT "RowValueSelection_rowValueId_fkey" FOREIGN KEY ("rowValueId") REFERENCES "RowValue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailSender" ADD CONSTRAINT "EmailSender_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_emailSenderId_fkey" FOREIGN KEY ("emailSenderId") REFERENCES "EmailSender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutboundEmail" ADD CONSTRAINT "OutboundEmail_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutboundEmail" ADD CONSTRAINT "OutboundEmail_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutboundEmail" ADD CONSTRAINT "OutboundEmail_contactRowId_fkey" FOREIGN KEY ("contactRowId") REFERENCES "Row"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutboundEmail" ADD CONSTRAINT "OutboundEmail_fromSenderId_fkey" FOREIGN KEY ("fromSenderId") REFERENCES "EmailSender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutboundEmailOpen" ADD CONSTRAINT "OutboundEmailOpen_outboundEmailId_fkey" FOREIGN KEY ("outboundEmailId") REFERENCES "OutboundEmail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutboundEmailClick" ADD CONSTRAINT "OutboundEmailClick_outboundEmailId_fkey" FOREIGN KEY ("outboundEmailId") REFERENCES "OutboundEmail"("id") ON DELETE CASCADE ON UPDATE CASCADE;
