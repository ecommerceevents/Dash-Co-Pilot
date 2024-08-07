export type VersionDto = {
  current: string;
  latest: string;
  hasUpdate: boolean;
  versions: {
    description: string;
    current: boolean;
    latest: boolean;
    version: string;
    date: Date;
  }[];
};
