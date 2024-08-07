-- CreateTable
CREATE TABLE "EntityTemplate" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT,
    "entityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "config" TEXT NOT NULL,

    CONSTRAINT "EntityTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EntityTemplate_tenantId_entityId_title_key" ON "EntityTemplate"("tenantId", "entityId", "title");

-- AddForeignKey
ALTER TABLE "EntityTemplate" ADD CONSTRAINT "EntityTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityTemplate" ADD CONSTRAINT "EntityTemplate_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
