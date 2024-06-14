import { useCallback, useState } from 'react';

import { FacetConfig, search } from '@/libs/api';

const mockedResponse = (facetId: string, data: FacetConfig) => {
  const date = new Date();
  return {
    id: facetId,
    lastChanged: {
      date: `${date.toISOString()}`,
      user: 'Test User',
    },
    indexPropertyName: data.indexPropertyName,
    merged: data.merged,
    displayValue: data.displayValue,
  };
};

export const useGlobalFacetUpdate = () => {
  const [error, setError] = useState('');

  const handleUpdate = useCallback(
    async ({ facetId, data }: { facetId: string; data: FacetConfig }) => {
      setError('');

      return mockedResponse(facetId, data);

      // istanbul ignore next
      try {
        const response = await search().betaMerchandisingFacetUpdate(
          facetId,
          data
        );

        return response.data;
      } catch (error) {
        setError(`Failed to update facet ${JSON.stringify(error)}`);
      }
    },
    []
  );

  return { handleUpdate, error };
};
