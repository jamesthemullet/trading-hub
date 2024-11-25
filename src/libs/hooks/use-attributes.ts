import { useEffect, useState } from 'react';

import { union, uniqBy } from 'lodash';

import { AttributesResponse, AttributeType, CountryCode, search } from '../api';
import { convertCountryCodeToCatalogues } from '../components/utils/convert-country-code-to-catalogues';

type Props = {
  category?: string;
  searchTerms?: string[];
  type?: AttributeType;
  countryCode: CountryCode;
};

export const useAttributes = ({
  category,
  countryCode,
  searchTerms,
  type,
}: Props) => {
  const [attributes, setAttributes] = useState<
    AttributesResponse['attributes']
  >([]);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    const asyncCall = async () => {
      try {
        setFetchError('');
        const catalogues = convertCountryCodeToCatalogues(countryCode);

        const promises = catalogues.map((catalogue) =>
          search()
            .betaMerchandisingAttributesList({
              ...(category && { categoryId: category }),
              ...(searchTerms && { searchTerms }),
              type,
              catalogue,
            })
            .then((response) => response.data.attributes)
        );

        const results = await Promise.all(promises);

        const res = uniqBy(union(results), 'name');
        setAttributes(res[0]);
      } catch (err) {
        setFetchError(`Error: ${err}`);
      }
    };

    void asyncCall();
  }, [category, countryCode, searchTerms, type]);

  return { attributes, fetchError };
};
