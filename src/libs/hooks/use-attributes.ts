import { useEffect, useState } from 'react';

import { AttributesResponse, AttributeType, search } from '../api';

type Props = {
  category?: string;
  searchTerms?: string[];
  type?: AttributeType;
};

export const useAttributes = ({ category, searchTerms, type }: Props) => {
  const [attributes, setAttributes] = useState<
    AttributesResponse['attributes']
  >([]);

  useEffect(() => {
    const fetchAttributes = async () => {
      const response = await search().betaMerchandisingAttributesList({
        ...(category && { categoryId: category }),
        ...(searchTerms && { searchTerms }),
        type,
      });
      setAttributes(response.data.attributes);
    };

    fetchAttributes();
  }, [category, searchTerms, type]);

  return { attributes };
};
