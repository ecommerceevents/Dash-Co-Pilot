export type UserPreferencesUpdatedDto = {
  new: {
    locale: string;
  };
  old: {
    locale: string;
  };
  user: {
    id: string;
    email: string;
  };
};
