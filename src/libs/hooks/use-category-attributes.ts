import { useEffect, useState } from 'react';

import { AttributesResponse, AttributeType, merchandising } from '../api';

export const useCategoryAttributes = (
  category?: string,
  type?: AttributeType
) => {
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
