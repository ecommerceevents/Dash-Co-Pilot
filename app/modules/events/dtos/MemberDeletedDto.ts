export type MemberDeletedDto = {
  tenant: {
    id: string;
    name: string;
  };
  fromUser: {
    id: string;
    email: string;
  };
  user: {
    id: string;
    email: string;
  };
};
