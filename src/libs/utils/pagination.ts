/**
 * Converts a 1-based page number and page size into a 0-based item offset,
 * suitable for API `start` params or slicing.
 */
export const getPaginationOffset = (
  currentPage: number,
  currentPageSize: number
): number => (currentPage - 1) * currentPageSize;
