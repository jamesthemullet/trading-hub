import { useEffect, useState } from 'react';
import { AttributeType, AttributesResponse, merchandising } from '../api';

export const useAttributes = (category?: string, type?: AttributeType) => {
  const [attributes, setAttributes] = useState<
    AttributesResponse['attributes']
  >([]);

  useEffect(() => {
    if (!category) return;
    const fetchAttributes = async () => {
      const response = await merchandising().categoryAttributesDetail(
        category,
        {
          type,
        }
      );
      setAttributes(response.data.attributes);
    };

    fetchAttributes();
  }, [category, type]);

  return { attributes };
};
