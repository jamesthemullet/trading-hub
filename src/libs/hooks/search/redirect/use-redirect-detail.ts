import { useEffect, useMemo, useState } from 'react';

import type { ReturnedKeywordRedirect } from '@/libs/api';
import { search } from '@/libs/api';

export const useRedirectDetail = (id: string) => {
  const api = useMemo(() => search(), []);

  const [redirect, setRedirect] = useState<ReturnedKeywordRedirect>({
    keywords: [],
    destinationUrl: '',
    isEnabled: false,
    type: 'redirectTerm',
    id,
    lastChanged: {
      user: '',
      date: '',
    },
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const asyncCall = async () => {
      try {
        const response = await api.betaMerchandisingKeywordRedirectDetail(id);

        const data = response.data;

        setRedirect(data);
        setError('');
      } catch (error) {
        console.log('error', error);
        if (error && typeof error === 'object' && 'status' in error) {
          setError(`POST status ${error.status}`);
          setIsLoading(false);
          return;
        }
      }
      setIsLoading(false);
    };
    setIsLoading(true);
    void asyncCall();
  }, [id, api]);

  return { redirect, error, isLoading };
};
