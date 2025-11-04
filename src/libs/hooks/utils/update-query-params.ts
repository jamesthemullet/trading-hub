import type { NextRouter } from 'next/router';

type QueryParams = {
  currentPage: number;
  currentPageSize: number;
  searchQuery: string;
};

export const updateQueryParams = (router: NextRouter, params: QueryParams) => {
  const newQuery = { ...router.query, ...params };

  const filteredQuery = Object.fromEntries(
    Object.entries(newQuery).filter(
      ([key, value]) => key !== 'searchQuery' || value !== ''
    )
  );

  router.push({
    pathname: router.pathname,
    query: filteredQuery,
  });
};
