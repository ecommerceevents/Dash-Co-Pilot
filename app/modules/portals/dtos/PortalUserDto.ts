export type PortalUserDto = {
  id: string;
  createdAt: Date;
  portalId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
};
