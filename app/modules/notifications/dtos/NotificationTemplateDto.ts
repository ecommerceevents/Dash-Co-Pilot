// https://docs.novu.co/api/get-notification-templates/
export interface NotificationTemplateDto {
  _id?: string;
  name: string;
  description: string;
  active: boolean;
  draft: boolean;
  preferenceSettings: {
    email: boolean;
    sms: boolean;
    in_app: boolean;
    chat: boolean;
    push: boolean;
  };
  critical: boolean;
  tags: string[];
  steps: any[];
  _organizationId: string;
  _creatorId: string;
  _environmentId: string;
  triggers: any[];
  _notificationGroupId: string;
  _parentId?: string;
  deleted: boolean;
  deletedAt: string;
  deletedBy: string;
  notificationGroup?: {
    _id?: string;
    name?: string;
    _environmentId?: string;
    _organizationId?: string;
    _parentId?: string;
  };
}
