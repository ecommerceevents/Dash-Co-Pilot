export type MemberInvitationCreatedDto = {
  tenant: {
    id: string;
    name: string;
  };
  user: {
    email: string;
    firstName: string;
    lastName: string;
    type: string;
  };
  fromUser: {
    id: string;
    email: string;
  };
};
