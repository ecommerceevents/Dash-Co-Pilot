export type AccountUpdatedDto = {
  id: string;
  new: {
    name: string;
    slug: string;
  };
  old: {
    name: string;
    slug: string;
  };
  user: {
    id: string;
    email: string;
  };
};
