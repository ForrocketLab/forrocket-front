/**
 * Interface para parâmetros de paginação dos colaboradores
 */
interface CollaboratorsPaginationParams {
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'status' | 'position' | 'department';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Interface para resposta paginada de colaboradores
 */
interface PaginatedCollaboratorsResponse {
  data: DashboardSubordinate[];
  meta: PaginationMeta;
}
