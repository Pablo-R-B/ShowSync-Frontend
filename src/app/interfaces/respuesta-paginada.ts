export interface RespuestaPaginada<T> {
  length: number;
  items: T[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
  pageSize: number;

  hasNext: boolean;
  hasPrevious: boolean;
}
