import { useEffect, useState } from 'react';

import { AttributesResponse, AttributeType, search } from '@/libs/api';

export const useGlobalAttributes = (type?: AttributeType) => {
  const [isLoading, setIsLoading] = useState(false);
  const [attributes, setAttributes] = useState<
    AttributesResponse['attributes']
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
