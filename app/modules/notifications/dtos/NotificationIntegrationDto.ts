// https://docs.novu.co/api/get-integrations/
export interface NotificationIntegrationDto {
  _id: string;
  _environmentId: string;
  _organizationId: string;
  providerId: string;
  channel: string;
  credentials: any;
  active: boolean;
  deleted: boolean;
  deletedAt: string;
  deletedBy: string;
}
