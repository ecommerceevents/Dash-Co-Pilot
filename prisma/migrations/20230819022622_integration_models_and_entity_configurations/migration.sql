-- AlterTable
ALTER TABLE "EntityGroupEntity" ADD COLUMN     "selectMax" INTEGER,
ADD COLUMN     "selectMin" INTEGER;

-- AlterTable
ALTER TABLE "Row" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "config" TEXT NOT NULL,
    "tenantId" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationObjectMap" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "integrationId" TEXT NOT NULL,
    "fromName" TEXT NOT NULL,
    "fromTitle" TEXT NOT NULL,
    "toEntityId" TEXT NOT NULL,

    CONSTRAINT "IntegrationObjectMap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationPropertyMap" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "objectMapId" TEXT NOT NULL,
    "fromName" TEXT NOT NULL,
    "fromTitle" TEXT NOT NULL,
    "fromType" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isUnique" BOOLEAN NOT NULL DEFAULT false,
    "toPropertyId" TEXT NOT NULL,

    CONSTRAINT "IntegrationPropertyMap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationSync" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "integrationId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "createdByUserId" TEXT,
    "createdByApiKeyId" TEXT,

    CONSTRAINT "IntegrationSync_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationSyncLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "syncId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "rowId" TEXT,
    "relationshipId" TEXT,

    CONSTRAINT "IntegrationSyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationRow" (
    "id" TEXT NOT NULL,
    "objectMapId" TEXT NOT NULL,
    "rowId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,

    CONSTRAINT "IntegrationRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntityGroupConfiguration" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT,
    "entityGroupId" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "EntityGroupConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntityGroupConfigurationRow" (
    "id" TEXT NOT NULL,
    "entityGroupConfigurationId" TEXT NOT NULL,
    "rowId" TEXT NOT NULL,

    CONSTRAINT "EntityGroupConfigurationRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileChunk" (
    "id" SERIAL NOT NULL,
    "fileUploadId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,

    CONSTRAINT "FileChunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Integration_type_isAdmin_tenantId_key" ON "Integration"("type", "isAdmin", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "EntityGroupConfigurationRow_entityGroupConfigurationId_rowI_key" ON "EntityGroupConfigurationRow"("entityGroupConfigurationId", "rowId");

-- CreateIndex
CREATE INDEX "group_createdByUserId" ON "Group"("createdByUserId");

-- CreateIndex
CREATE INDEX "row_deletedAt" ON "Row"("deletedAt");

-- CreateIndex
CREATE INDEX "row_entity_tenant_created_at" ON "Row"("entityId", "tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "row_createdByUserId" ON "Row"("createdByUserId");

-- CreateIndex
CREATE INDEX "row_permission_public" ON "RowPermission"("public");

-- AddForeignKey
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationObjectMap" ADD CONSTRAINT "IntegrationObjectMap_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationObjectMap" ADD CONSTRAINT "IntegrationObjectMap_toEntityId_fkey" FOREIGN KEY ("toEntityId") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationPropertyMap" ADD CONSTRAINT "IntegrationPropertyMap_objectMapId_fkey" FOREIGN KEY ("objectMapId") REFERENCES "IntegrationObjectMap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationPropertyMap" ADD CONSTRAINT "IntegrationPropertyMap_toPropertyId_fkey" FOREIGN KEY ("toPropertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationSync" ADD CONSTRAINT "IntegrationSync_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationSync" ADD CONSTRAINT "IntegrationSync_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationSync" ADD CONSTRAINT "IntegrationSync_createdByApiKeyId_fkey" FOREIGN KEY ("createdByApiKeyId") REFERENCES "ApiKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationSyncLog" ADD CONSTRAINT "IntegrationSyncLog_syncId_fkey" FOREIGN KEY ("syncId") REFERENCES "IntegrationSync"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationSyncLog" ADD CONSTRAINT "IntegrationSyncLog_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationSyncLog" ADD CONSTRAINT "IntegrationSyncLog_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "Row"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationSyncLog" ADD CONSTRAINT "IntegrationSyncLog_relationshipId_fkey" FOREIGN KEY ("relationshipId") REFERENCES "RowRelationship"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationRow" ADD CONSTRAINT "IntegrationRow_objectMapId_fkey" FOREIGN KEY ("objectMapId") REFERENCES "IntegrationObjectMap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationRow" ADD CONSTRAINT "IntegrationRow_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "Row"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityGroupConfiguration" ADD CONSTRAINT "EntityGroupConfiguration_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityGroupConfiguration" ADD CONSTRAINT "EntityGroupConfiguration_entityGroupId_fkey" FOREIGN KEY ("entityGroupId") REFERENCES "EntityGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityGroupConfigurationRow" ADD CONSTRAINT "EntityGroupConfigurationRow_entityGroupConfigurationId_fkey" FOREIGN KEY ("entityGroupConfigurationId") REFERENCES "EntityGroupConfiguration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityGroupConfigurationRow" ADD CONSTRAINT "EntityGroupConfigurationRow_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "Row"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileChunk" ADD CONSTRAINT "FileChunk_fileUploadId_fkey" FOREIGN KEY ("fileUploadId") REFERENCES "FileUploadProgress"("id") ON DELETE CASCADE ON UPDATE CASCADE;
