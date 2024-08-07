export type UserPasswordUpdatedDto = {
  user: {
    id: string;
    email: string;
  };
  fromUser?: {
    id: string;
    email: string;
  };
};
