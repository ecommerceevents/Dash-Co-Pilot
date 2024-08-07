export interface PaginationResultDto {
  totalItems: number;
  totalPages: number;
  page: number;
  pageSize: number;
  sortedBy: any;
  query: any;
}
