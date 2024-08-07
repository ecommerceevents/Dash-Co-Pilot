export type RowPermissionsDto = {
  canRead?: boolean;
  canComment: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  isOwner: boolean;
};
