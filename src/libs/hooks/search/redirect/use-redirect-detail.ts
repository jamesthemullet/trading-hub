import { useEffect, useMemo, useState } from 'react';

import type { MerchandisingReturnedKeywordRedirect } from '@/libs/api';
import { search } from '@/libs/api';

export const useRedirectDetail = (
  id: string
): {
  redirect: MerchandisingReturnedKeywordRedirect;
  error: string;
  isLoading: boolean;
} => {
  const api = useMemo(() => search(), []);

  const [redirect, setRedirect] =
    useState<MerchandisingReturnedKeywordRedirect>({
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
    if (!id) {
      setIsLoading(false);
      return;
    }

    const asyncCall = async () => {
      try {
        const response = await api.getKeywordRedirect(id);

        const data = response.data;

        setRedirect(data);
        setError('');
      } catch (error) {
        // istanbul ignore else
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
