-- DropForeignKey
ALTER TABLE "PromptTemplateResult" DROP CONSTRAINT "PromptTemplateResult_flowExecutionId_fkey";

-- DropForeignKey
ALTER TABLE "PromptTemplateResult" DROP CONSTRAINT "PromptTemplateResult_templateId_fkey";

-- AlterTable
ALTER TABLE "Entity" ADD COLUMN     "promptFlowGroupId" TEXT;

-- AlterTable
ALTER TABLE "PromptFlow" ADD COLUMN     "promptFlowGroupId" TEXT,
ADD COLUMN     "stream" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "PromptTemplate" ADD COLUMN     "generations" INTEGER,
ADD COLUMN     "maxTokens" INTEGER;

-- AlterTable
ALTER TABLE "PromptTemplateResult" ALTER COLUMN "templateId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "PromptFlowGroup" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "PromptFlowGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptFlowGroupTemplate" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "promptFlowGroupId" TEXT NOT NULL,

    CONSTRAINT "PromptFlowGroupTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptFlowGroupEntity" (
    "entityId" TEXT NOT NULL,
    "promptFlowGroupId" TEXT NOT NULL,

    CONSTRAINT "PromptFlowGroupEntity_pkey" PRIMARY KEY ("entityId","promptFlowGroupId")
);

-- CreateTable
CREATE TABLE "TenantType" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "titlePlural" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TenantType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantTypeEntity" (
    "id" TEXT NOT NULL,
    "tenantTypeId" TEXT,
    "entityId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,

    CONSTRAINT "TenantTypeEntity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantTypeRelationship" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "canCreate" BOOLEAN NOT NULL DEFAULT false,
    "fromTypeId" TEXT,
    "toTypeId" TEXT,

    CONSTRAINT "TenantTypeRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantRelationship" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantTypeRelationshipId" TEXT NOT NULL,
    "fromTenantId" TEXT NOT NULL,
    "toTenantId" TEXT NOT NULL,
    "createdByUserId" TEXT,

    CONSTRAINT "TenantRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TenantToTenantType" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_PermissionToTenantTypeRelationship" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_SubscriptionProductToTenantType" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "TenantType_title_key" ON "TenantType"("title");

-- CreateIndex
CREATE UNIQUE INDEX "TenantTypeRelationship_fromTypeId_toTypeId_key" ON "TenantTypeRelationship"("fromTypeId", "toTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantRelationship_fromTenantId_toTenantId_key" ON "TenantRelationship"("fromTenantId", "toTenantId");

-- CreateIndex
CREATE UNIQUE INDEX "_TenantToTenantType_AB_unique" ON "_TenantToTenantType"("A", "B");

-- CreateIndex
CREATE INDEX "_TenantToTenantType_B_index" ON "_TenantToTenantType"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PermissionToTenantTypeRelationship_AB_unique" ON "_PermissionToTenantTypeRelationship"("A", "B");

-- CreateIndex
CREATE INDEX "_PermissionToTenantTypeRelationship_B_index" ON "_PermissionToTenantTypeRelationship"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_SubscriptionProductToTenantType_AB_unique" ON "_SubscriptionProductToTenantType"("A", "B");

-- CreateIndex
CREATE INDEX "_SubscriptionProductToTenantType_B_index" ON "_SubscriptionProductToTenantType"("B");

-- AddForeignKey
ALTER TABLE "PromptFlowGroupTemplate" ADD CONSTRAINT "PromptFlowGroupTemplate_promptFlowGroupId_fkey" FOREIGN KEY ("promptFlowGroupId") REFERENCES "PromptFlowGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptFlowGroupEntity" ADD CONSTRAINT "PromptFlowGroupEntity_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptFlowGroupEntity" ADD CONSTRAINT "PromptFlowGroupEntity_promptFlowGroupId_fkey" FOREIGN KEY ("promptFlowGroupId") REFERENCES "PromptFlowGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptFlow" ADD CONSTRAINT "PromptFlow_promptFlowGroupId_fkey" FOREIGN KEY ("promptFlowGroupId") REFERENCES "PromptFlowGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptTemplateResult" ADD CONSTRAINT "PromptTemplateResult_flowExecutionId_fkey" FOREIGN KEY ("flowExecutionId") REFERENCES "PromptFlowExecution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptTemplateResult" ADD CONSTRAINT "PromptTemplateResult_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "PromptTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantTypeEntity" ADD CONSTRAINT "TenantTypeEntity_tenantTypeId_fkey" FOREIGN KEY ("tenantTypeId") REFERENCES "TenantType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantTypeEntity" ADD CONSTRAINT "TenantTypeEntity_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantTypeRelationship" ADD CONSTRAINT "TenantTypeRelationship_fromTypeId_fkey" FOREIGN KEY ("fromTypeId") REFERENCES "TenantType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantTypeRelationship" ADD CONSTRAINT "TenantTypeRelationship_toTypeId_fkey" FOREIGN KEY ("toTypeId") REFERENCES "TenantType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantRelationship" ADD CONSTRAINT "TenantRelationship_tenantTypeRelationshipId_fkey" FOREIGN KEY ("tenantTypeRelationshipId") REFERENCES "TenantTypeRelationship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantRelationship" ADD CONSTRAINT "TenantRelationship_fromTenantId_fkey" FOREIGN KEY ("fromTenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantRelationship" ADD CONSTRAINT "TenantRelationship_toTenantId_fkey" FOREIGN KEY ("toTenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantRelationship" ADD CONSTRAINT "TenantRelationship_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TenantToTenantType" ADD CONSTRAINT "_TenantToTenantType_A_fkey" FOREIGN KEY ("A") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TenantToTenantType" ADD CONSTRAINT "_TenantToTenantType_B_fkey" FOREIGN KEY ("B") REFERENCES "TenantType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToTenantTypeRelationship" ADD CONSTRAINT "_PermissionToTenantTypeRelationship_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToTenantTypeRelationship" ADD CONSTRAINT "_PermissionToTenantTypeRelationship_B_fkey" FOREIGN KEY ("B") REFERENCES "TenantTypeRelationship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubscriptionProductToTenantType" ADD CONSTRAINT "_SubscriptionProductToTenantType_A_fkey" FOREIGN KEY ("A") REFERENCES "SubscriptionProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubscriptionProductToTenantType" ADD CONSTRAINT "_SubscriptionProductToTenantType_B_fkey" FOREIGN KEY ("B") REFERENCES "TenantType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
