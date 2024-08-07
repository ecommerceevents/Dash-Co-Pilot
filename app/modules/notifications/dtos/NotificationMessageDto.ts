// https://docs.novu.co/api/get-messages/
export interface NotificationMessageDto {
  _id: string;
  _templateId: string;
  _environmentId: string;
  _messageTemplateId: string;
  _notificationId: string;
  _organizationId: string;
  _subscriberId: string;
  _jobId: string;
  templateIdentifier: string;
  cta?: { data?: { url?: string } }[];
  channel: string;
  seen?: boolean;
  read?: boolean;
  status: string;
  transactionId: string;
  payload: any;
  deleted?: boolean;
  createdAt: string;
  updatedAt?: string;
  lastReadDate?: string;
  lastSeenDate?: string;
}
