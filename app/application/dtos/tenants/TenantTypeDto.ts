export type TenantTypeDto = {
  id?: string;
  title: string;
  titlePlural: string;
  description: string | null;
  isDefault?: boolean;
  subscriptionProducts?: { id?: string; title: string }[];
  _count?: { tenants: number };
};
