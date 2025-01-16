import styled from '@emotion/styled';
import { useState } from 'react';

import { Pagination as PaginationType } from '@/libs/api/generated/open-api';

import { Dropdown } from '../dropdowns/dropdown/dropdown';
import { spacing } from '../utils/spacing';
import { Pagination } from './pagination';

export const NavigationContainer = styled.div`
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
export const TotalResultsLabel = styled.div`
  font-family: mnsLondonRegular, monospace;
  margin-left: 31px;
`;
const RowsPerPageLabel = styled.div``;
export const RowsPerPageContainer = styled.div`
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
}: {
  pagination: PaginationType;
  pageSizes: number[];
  handlePageChange: (page: number, pageSize: number) => void;
  currentPage: number;
  currentPageSize: number;
}) => {
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);

  return (
    <NavigationContainer>
      <TotalResultsLabel aria-label="results count">
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
        <RowsPerPageLabel>Rows per page</RowsPerPageLabel>
        <Dropdown
          label={`${currentPageSize}`}
          isOpen={isPageSizeOpen}
          aria-label="rows per page"
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
    </NavigationContainer>
  );
};
