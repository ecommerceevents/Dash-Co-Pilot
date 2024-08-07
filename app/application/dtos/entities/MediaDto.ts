export type MediaDto = {
  id?: string;
  title: string;
  name: string;
  file: string;
  type: string;
  publicUrl?: string | null;
  storageBucket?: string | null;
  storageProvider?: string | null;
};
