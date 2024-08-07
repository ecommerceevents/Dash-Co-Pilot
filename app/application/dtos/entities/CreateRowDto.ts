export type CreateRowDto = {
  entityId: string;
  createdByUserId: string;
  tenantId?: string;
  linkedAccountId?: string;
};
