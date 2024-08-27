import { Skeleton } from '@mantine/core';

import {
  NavigationContainer,
  RowsPerPageContainer,
  TotalResultsLabel,
} from './table-pagination';

export const TablePaginationSkeleton = () => {
  return (
    <>
      <NavigationContainer>
        <TotalResultsLabel>
          <Skeleton
            height={40}
            width={84}
            mb={24}
            aria-label="table-pagination-skeleton"
          />
        </TotalResultsLabel>
        <Skeleton height={40} width={173} mb={24} />
        <RowsPerPageContainer>
          <Skeleton height={40} width={235} mb={24} />
        </RowsPerPageContainer>
      </NavigationContainer>
    </>
  );
};
