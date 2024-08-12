import { useEffect, useState } from 'react';

import type { ReturnedKeywordRedirects } from '@/libs/api';
import { search } from '@/libs/api';

export const useSearchRedirectList = (
  searchQuery: string,
  start: number,
  rows: number
) => {
  const [shouldRefetch, refetch] = useState({});
  const [keywordList, setKeywordList] = useState<ReturnedKeywordRedirects>({
    pagination: { totalItems: 0 },
    redirects: [],
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const asyncCall = async () => {
      try {
        const result = await search().betaMerchandisingKeywordRedirectList({
          q: searchQuery,
          start,
          rows,
        });

        setKeywordList(result.data);
      } catch {
        setError('Internal Server Error');
      }
    };

    void asyncCall();
  }, [start, rows, searchQuery, shouldRefetch]);

  return {
    error,
    pagination: keywordList.pagination,
    refetchRedirectList: () => refetch({}),
    redirects: keywordList.redirects,
  };
};
