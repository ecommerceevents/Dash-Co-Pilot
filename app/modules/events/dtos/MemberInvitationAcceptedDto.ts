export type MemberInvitationAcceptedDto = {
  newUser: boolean;
  tenant: {
    id: string;
    name: string;
    slug: string;
  };
  fromUser: {
    id: string;
    email: string;
  } | null;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    type: string;
  };
  invitation: {
    id: string;
  };
};
