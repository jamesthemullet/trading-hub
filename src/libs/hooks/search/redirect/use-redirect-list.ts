import { useEffect, useState } from 'react';

import type { CountryCode, ReturnedKeywordRedirects } from '@/libs/api';
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
  const [countryCode, setCountryCode] = useState<CountryCode>();

  useEffect(() => {
    const asyncCall = async () => {
      try {
        const result = await search().betaMerchandisingKeywordRedirectList({
          q: searchQuery,
          start,
          rows,
          countryCode,
        });

        setKeywordList(result.data);
      } catch {
        setError('Internal Server Error');
      }
    };

    void asyncCall();
  }, [start, rows, searchQuery, shouldRefetch, countryCode]);

  return {
    error,
    pagination: keywordList.pagination,
    refetchRedirectList: ({ countryCode }: { countryCode?: CountryCode }) => {
      setCountryCode(countryCode);
      refetch({});
    },
    redirects: keywordList.redirects,
    setKeywordList,
  };
};
