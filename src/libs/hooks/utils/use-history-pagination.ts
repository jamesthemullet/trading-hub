import { useEffect, useRef, useState } from 'react';

import type { MerchandisingPagination } from '@/libs/api';
import { getPaginationOffset } from '@/libs/utils/pagination';

import { handleError } from './error';

export type HistoryState<TChange> = {
  changes: TChange[];
  pagination: MerchandisingPagination;
};

export type HistoryResult<TChange> = {
  history: HistoryState<TChange>;
  error: string;
  isLoading: boolean;
};

export const useHistoryPagination = <TChange>(
  id: string,
  currentPage: number,
  currentPageSize: number,
  fetcher: (
    id: string,
    params: { start: number; rows: number }
  ) => Promise<{ data: HistoryState<TChange> }>
): HistoryResult<TChange> => {
  const [history, setHistory] = useState<HistoryState<TChange>>({
    changes: [],
    pagination: { totalItems: 0 },
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    // Only mutates the local ref; does not trigger a re-render.
    // eslint-disable-next-line functional/immutable-data
    fetcherRef.current = fetcher;
  }, [fetcher]);

  useEffect(() => {
    if (!id) {
      setHistory({ changes: [], pagination: { totalItems: 0 } });
      setError('');
      setIsLoading(false);
      return;
    }

    const asyncCall = async () => {
      setIsLoading(true);
      setError('');

      try {
        const result = await fetcherRef.current(id, {
          start: getPaginationOffset(currentPage, currentPageSize),
          rows: currentPageSize,
        });
        setHistory(result.data);
      } catch (err) {
        setError(handleError(err));
      } finally {
        setIsLoading(false);
      }
    };

    void asyncCall();
  }, [id, currentPage, currentPageSize]);

  return { history, error, isLoading };
};
