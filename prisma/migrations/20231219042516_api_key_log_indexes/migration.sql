-- CreateIndex
CREATE INDEX "api_key_log_tenant" ON "ApiKeyLog"("tenantId");

-- CreateIndex
CREATE INDEX "api_key_log_tenant_created_at" ON "ApiKeyLog"("tenantId", "createdAt");
