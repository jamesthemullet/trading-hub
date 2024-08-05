import { useEffect, useState } from 'react';

import { AttributesResponse, search } from '@/libs/api';

export const useGetFacetAttributes = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [attributesList, setAttributesList] = useState<AttributesResponse>({
    attributes: [],
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const asyncCall = async () => {
      try {
        const response = await search().betaMerchandisingAttributesList();

        const attributesList = response.data;

        setAttributesList(attributesList);
      } catch {
        setError('Internal Server Error');
      } finally {
        setIsLoading(false);
      }
    };
    void asyncCall();
    setIsLoading(true);
  }, []);

  return {
    attributes: attributesList.attributes,
    isLoading,
    error,
  };
};
