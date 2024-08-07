export type RowTasksDeletedDto = {
  rowId: string;
  task: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    email: string;
  } | null;
  apiKey?: {
    id: string;
    alias: string;
  };
};
