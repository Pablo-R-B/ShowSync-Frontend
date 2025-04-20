export interface RespuestaPaginada<T> {
  items: T[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
  pageSize: number;
}
