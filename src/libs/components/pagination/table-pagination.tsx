import { Skeleton } from '@mantine/core';

import type { MerchandisingPagination as PaginationType } from '@/libs/api/generated/open-api';
import { Button } from '@/libs/components/button/button';

import { CombinedDropdown } from '../dropdown/dropdown';
import { Typography } from '../typography/typography';
import { Pagination } from './pagination';
import styles from './pagination.module.css';

export const TablePagination = ({
  pagination,
  pageSizes,
  handlePageChange,
  currentPage,
  currentPageSize,
  isLoading,
}: {
  pagination: PaginationType;
  pageSizes: number[];
  handlePageChange: (page: number, pageSize: number) => void;
  currentPage: number;
  currentPageSize: number;
  isLoading: boolean;
}) => {
  return (
    <div className={styles.paginationRowContainer}>
      {isLoading ? (
        <>
          <div className={`${styles.totalResultsLabel}`} aria-busy="true">
            <Skeleton
              height={40}
              width={84}
              mb={24}
              data-testid="table-pagination-skeleton"
            />
          </div>
          <Skeleton height={40} width={173} mb={24} aria-busy="true" />
          <div className={`${styles.rowsPerPageContainer} `}>
            <Skeleton height={40} width={235} mb={24} aria-busy="true" />
          </div>
        </>
      ) : (
        <>
          <Typography variant="bodySmall" data-testid="results count">
            {pagination.totalItems} results
          </Typography>

          <Pagination
            current={currentPage}
            total={Math.max(
              1,
              Math.ceil((pagination.totalItems ?? 0) / currentPageSize)
            )}
            onClick={(pageNumber) => {
              handlePageChange(pageNumber, currentPageSize);
            }}
          />
          <div className={`${styles.rowsPerPageContainer}`}>
            <Typography variant="bodySmall">Rows per page</Typography>
            <CombinedDropdown
              variant="pageSize"
              label={`${currentPageSize}`}
              width={125}
              ariaLabel="Select rows per page"
            >
              {pageSizes.map((size) => (
                <Button
                  key={size}
                  onClick={() => {
                    if (
                      currentPage * size >
                      Math.ceil(pagination.totalItems ?? 0 / size)
                    ) {
                      handlePageChange(1, size);
                    } else {
                      handlePageChange(currentPage, size);
                    }
                  }}
                  role="option"
                  aria-selected={currentPageSize === size}
                  isInline
                >
                  {size}
                </Button>
              ))}
            </CombinedDropdown>
          </div>
        </>
      )}
    </div>
  );
};
