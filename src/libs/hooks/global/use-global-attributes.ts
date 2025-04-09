import { useEffect, useState } from 'react';

import type {
  MerchandisingAttributesResponse,
  MerchandisingAttributeType,
} from '@/libs/api';
import { search } from '@/libs/api';

export const useGlobalAttributes = (type?: MerchandisingAttributeType) => {
  const [isLoading, setIsLoading] = useState(false);
  const [attributes, setAttributes] = useState<
    MerchandisingAttributesResponse['attributes']
  >([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAttributes = async () => {
      setIsLoading(true);
      try {
        const response = await search().betaMerchandisingAttributesList({
          ...(type && { type }),
        });

        setAttributes(response.data.attributes);
      } catch {
        setError('Error fetching attributes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttributes();
  }, [type]);

  return { attributes, error, isLoading };
};
