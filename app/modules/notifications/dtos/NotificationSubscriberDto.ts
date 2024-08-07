// https://docs.novu.co/api/get-subscribers/
export interface NotificationSubscriberDto {
  _id: string; // The internal id novu generated for your subscriber, this is not the subscriberId matching your query. See `subscriberId` for that
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  subscriberId: string; // The internal identifier you used to create this subscriber, usually correlates to the id the user in your systems
  channels?: { _integrationId?: string; providerId?: string; credentials: string }[];
  _organizationId: string;
  _environmentId: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
