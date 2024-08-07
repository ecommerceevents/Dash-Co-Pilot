export type RowDeletedDto = {
  id: string;
  title: string;
  row: { [key: string]: any };
  entity: { id: string; name: string; slug: string; title: string };
  user?: {
    id: string;
    email: string;
  };
  apiKey?: {
    id: string;
    alias: string;
  };
};
