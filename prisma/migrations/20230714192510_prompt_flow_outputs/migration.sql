/*
  Warnings:

  - You are about to drop the column `entityViewId` on the `EntityRelationship` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "EntityRelationship" DROP CONSTRAINT "EntityRelationship_entityViewId_fkey";

-- AlterTable
ALTER TABLE "EntityRelationship" DROP COLUMN "entityViewId",
ADD COLUMN     "childEntityViewId" TEXT,
ADD COLUMN     "parentEntityViewId" TEXT;

-- AlterTable
ALTER TABLE "PromptFlow" ADD COLUMN     "inputEntityId" TEXT;

-- CreateTable
CREATE TABLE "PromptFlowInputVariable" (
    "id" TEXT NOT NULL,
    "promptFlowId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL,

    CONSTRAINT "PromptFlowInputVariable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptFlowOutput" (
    "id" TEXT NOT NULL,
    "promptFlowId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,

    CONSTRAINT "PromptFlowOutput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptFlowOutputMapping" (
    "id" TEXT NOT NULL,
    "promptFlowOutputId" TEXT NOT NULL,
    "promptTemplateId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,

    CONSTRAINT "PromptFlowOutputMapping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PromptFlowOutputMapping_promptFlowOutputId_promptTemplateId_key" ON "PromptFlowOutputMapping"("promptFlowOutputId", "promptTemplateId", "propertyId");

-- CreateIndex
CREATE INDEX "entity_name" ON "Entity"("name");

-- CreateIndex
CREATE INDEX "entity_slug" ON "Entity"("slug");

-- CreateIndex
CREATE INDEX "parent_entity_relationship" ON "EntityRelationship"("parentId");

-- CreateIndex
CREATE INDEX "child_entity_relationship" ON "EntityRelationship"("childId");

-- CreateIndex
CREATE INDEX "parent_child_entity_relationship" ON "EntityRelationship"("parentId", "childId");

-- CreateIndex
CREATE INDEX "parent_child_entity_relationship_order" ON "EntityRelationship"("parentId", "childId", "order");

-- CreateIndex
CREATE INDEX "entity_tag" ON "EntityTag"("entityId");

-- CreateIndex
CREATE INDEX "entity_tag_value" ON "EntityTag"("entityId", "value");

-- CreateIndex
CREATE INDEX "entity_view" ON "EntityView"("entityId");

-- CreateIndex
CREATE INDEX "entity_view_name" ON "EntityView"("entityId", "name");

-- CreateIndex
CREATE INDEX "entity_view_filter" ON "EntityViewFilter"("entityViewId");

-- CreateIndex
CREATE INDEX "entity_view_filter_name" ON "EntityViewFilter"("entityViewId", "name");

-- CreateIndex
CREATE INDEX "entity_view_property" ON "EntityViewProperty"("entityViewId");

-- CreateIndex
CREATE INDEX "entity_view_property_name" ON "EntityViewProperty"("entityViewId", "name");

-- CreateIndex
CREATE INDEX "entity_view_sort" ON "EntityViewSort"("entityViewId");

-- CreateIndex
CREATE INDEX "entity_view_sort_name" ON "EntityViewSort"("entityViewId", "name");

-- CreateIndex
CREATE INDEX "entity_workflow_state" ON "EntityWorkflowState"("entityId");

-- CreateIndex
CREATE INDEX "entity_workflow_state_name" ON "EntityWorkflowState"("entityId", "name");

-- CreateIndex
CREATE INDEX "entity_workflow_step" ON "EntityWorkflowStep"("entityId");

-- CreateIndex
CREATE INDEX "entity_property" ON "Property"("entityId");

-- CreateIndex
CREATE INDEX "entity_property_name" ON "Property"("entityId", "name");

-- CreateIndex
CREATE INDEX "property_attribute" ON "PropertyAttribute"("propertyId");

-- CreateIndex
CREATE INDEX "property_attribute_name" ON "PropertyAttribute"("propertyId", "name");

-- CreateIndex
CREATE INDEX "property_option" ON "PropertyOption"("propertyId");

-- CreateIndex
CREATE INDEX "property_option_name" ON "PropertyOption"("propertyId", "name");

-- CreateIndex
CREATE INDEX "row_entity" ON "Row"("entityId");

-- CreateIndex
CREATE INDEX "row_entity_tenant" ON "Row"("entityId", "tenantId");

-- CreateIndex
CREATE INDEX "row_tenant" ON "Row"("tenantId");

-- CreateIndex
CREATE INDEX "row_comment_row" ON "RowComment"("rowId");

-- CreateIndex
CREATE INDEX "row_media_row_value" ON "RowMedia"("rowValueId");

-- CreateIndex
CREATE INDEX "row_media_row_value_name" ON "RowMedia"("rowValueId", "name");

-- CreateIndex
CREATE INDEX "row_permission_row" ON "RowPermission"("rowId");

-- CreateIndex
CREATE INDEX "row_permission_row_tenant" ON "RowPermission"("rowId", "tenantId");

-- CreateIndex
CREATE INDEX "row_permission_row_role" ON "RowPermission"("rowId", "roleId");

-- CreateIndex
CREATE INDEX "row_permission_row_group" ON "RowPermission"("rowId", "groupId");

-- CreateIndex
CREATE INDEX "row_permission_row_user" ON "RowPermission"("rowId", "userId");

-- CreateIndex
CREATE INDEX "parent_row_relationship" ON "RowRelationship"("parentId");

-- CreateIndex
CREATE INDEX "child_row_relationship" ON "RowRelationship"("childId");

-- CreateIndex
CREATE INDEX "parent_child_row_relationship" ON "RowRelationship"("parentId", "childId");

-- CreateIndex
CREATE INDEX "row_tag_row" ON "RowTag"("rowId");

-- CreateIndex
CREATE INDEX "row_tag_row_tag" ON "RowTag"("rowId", "tagId");

-- CreateIndex
CREATE INDEX "row_value_row" ON "RowValue"("rowId");

-- CreateIndex
CREATE INDEX "row_value_row_property" ON "RowValue"("rowId", "propertyId");

-- CreateIndex
CREATE INDEX "row_value_multiple_row_value" ON "RowValueMultiple"("rowValueId");

-- CreateIndex
CREATE INDEX "row_value_range_row_value" ON "RowValueRange"("rowValueId");

-- CreateIndex
CREATE INDEX "Tenant_slug_idx" ON "Tenant"("slug");

-- AddForeignKey
ALTER TABLE "EntityRelationship" ADD CONSTRAINT "EntityRelationship_childEntityViewId_fkey" FOREIGN KEY ("childEntityViewId") REFERENCES "EntityView"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityRelationship" ADD CONSTRAINT "EntityRelationship_parentEntityViewId_fkey" FOREIGN KEY ("parentEntityViewId") REFERENCES "EntityView"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptFlow" ADD CONSTRAINT "PromptFlow_inputEntityId_fkey" FOREIGN KEY ("inputEntityId") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptFlowInputVariable" ADD CONSTRAINT "PromptFlowInputVariable_promptFlowId_fkey" FOREIGN KEY ("promptFlowId") REFERENCES "PromptFlow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptFlowOutput" ADD CONSTRAINT "PromptFlowOutput_promptFlowId_fkey" FOREIGN KEY ("promptFlowId") REFERENCES "PromptFlow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptFlowOutput" ADD CONSTRAINT "PromptFlowOutput_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptFlowOutputMapping" ADD CONSTRAINT "PromptFlowOutputMapping_promptFlowOutputId_fkey" FOREIGN KEY ("promptFlowOutputId") REFERENCES "PromptFlowOutput"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptFlowOutputMapping" ADD CONSTRAINT "PromptFlowOutputMapping_promptTemplateId_fkey" FOREIGN KEY ("promptTemplateId") REFERENCES "PromptTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptFlowOutputMapping" ADD CONSTRAINT "PromptFlowOutputMapping_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
