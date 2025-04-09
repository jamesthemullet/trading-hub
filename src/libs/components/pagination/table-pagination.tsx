import styled from '@emotion/styled';
import { useState } from 'react';
import { Skeleton } from '@mantine/core';

import type { MerchandisingPagination as PaginationType } from '@/libs/api/generated/open-api';

import { Dropdown } from '../dropdowns/dropdown/dropdown';
import { spacing } from '../utils/spacing';
import { Pagination } from './pagination';

const NavigationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  column-gap: ${spacing(4)};
  margin-left: auto;
  margin-right: ${spacing(2)};
  margin-bottom: ${spacing(18)};
  font-weight: 400;
  font-size: 14px;
`;
const TotalResultsLabel = styled.div`
  font-family: mnsLondonRegular, monospace;
  margin-left: 31px;
`;

const RowsPerPageContainer = styled.div`
  font-family: mnsLondonRegular, monospace;
  display: flex;
  column-gap: 10px;
  justify-content: center;
  align-items: baseline;
  margin-right: 18px;
`;
const PageSizeItem = styled.div`
  padding: ${spacing(1)};
  cursor: pointer;

  &:hover,
  &:focus {
    background-color: #f5f5f5;
  }
`;

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
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);

  return (
    <NavigationContainer>
      {isLoading ? (
        <>
          <TotalResultsLabel aria-busy="true">
            <Skeleton
              height={40}
              width={84}
              mb={24}
              data-testid="table-pagination-skeleton"
            />
          </TotalResultsLabel>
          <Skeleton height={40} width={173} mb={24} aria-busy="true" />
          <RowsPerPageContainer>
            <Skeleton height={40} width={235} mb={24} aria-busy="true" />
          </RowsPerPageContainer>
        </>
      ) : (
        <>
          <TotalResultsLabel data-testid="results count">
            {pagination.totalItems} results
          </TotalResultsLabel>
          <Pagination
            current={currentPage}
            total={Math.max(
              1,
              Math.ceil((pagination.totalItems ?? 0) / currentPageSize)
            )}
            onClick={(e, pageNumber) => {
              e.preventDefault();
              handlePageChange(pageNumber, currentPageSize);
            }}
          />
          <RowsPerPageContainer>
            <span>Rows per page</span>
            <Dropdown
              label={`${currentPageSize}`}
              isOpen={isPageSizeOpen}
              onOpen={() => {
                setIsPageSizeOpen(true);
              }}
              onClose={() => {
                setIsPageSizeOpen(false);
              }}
            >
              {pageSizes.map((size) => (
                <PageSizeItem
                  key={size}
                  onClick={() => {
                    setIsPageSizeOpen(false);
                    if (
                      currentPage * size >
                      Math.ceil(pagination.totalItems ?? 0 / size)
                    ) {
                      handlePageChange(1, size);
                    } else {
                      handlePageChange(currentPage, size);
                    }
                  }}
                >
                  {size}
                </PageSizeItem>
              ))}
            </Dropdown>
          </RowsPerPageContainer>
        </>
      )}
    </NavigationContainer>
  );
};
