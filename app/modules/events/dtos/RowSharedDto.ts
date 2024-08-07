export type RowSharedDto = {
  id: string;
  title: string;
  entity: { id: string; name: string; slug: string; title: string };
  type: "tenant" | "user" | "role" | "group" | "public";
  to: string;
  access: string;
  user?: {
    id: string;
    email: string;
  };
};
