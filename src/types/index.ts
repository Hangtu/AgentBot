// =============================================================================
// Shared TypeScript types/interfaces
// =============================================================================

/**
 * Standard response type for all Server Actions.
 * Uses discriminated union for better type inference:
 *
 * ```ts
 * const result = await myAction(input);
 * if (result.success) {
 *   result.data; // ✅ TypeScript knows `data` exists
 * } else {
 *   result.error; // ✅ TypeScript knows `error` exists
 * }
 * ```
 */
export type ActionResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

/**
 * Paginated response wrapper.
 */
export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

/**
 * Search/filter params for list queries.
 */
export type ListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};
