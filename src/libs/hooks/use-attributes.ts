import { useEffect, useState } from 'react';

import { uniqBy } from 'lodash';

import { AttributesResponse, AttributeType, CountryCode, search } from '../api';
import {
  convertCategoryIdToCatalogue,
  convertCountryCodeToCatalogues,
} from '../components/utils/convert-country-code-to-catalogues';

type Props = {
  countryCode: CountryCode;
  type: AttributeType;
  categories?: string[];
  searchTerms?: string[];
};

export const useAttributes = ({
  categories,
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
        const promises = categories?.length
          ? categories.map((categoryId) =>
              search()
                .betaMerchandisingAttributesList({
                  categoryId,
                  type,
                  catalogue: convertCategoryIdToCatalogue(categoryId),
                })
                .then((response) => response.data.attributes)
            )
          : catalogues.map((catalogue) =>
              search()
                .betaMerchandisingAttributesList({
                  searchTerm: searchTerms,
                  type,
                  catalogue,
                })
                .then((response) => response.data.attributes)
            );

        const results = await Promise.all(promises);

        const res = uniqBy(results.flat(), 'name');
        setAttributes(res);
      } catch (err) {
        setFetchError(`Error: ${err}`);
      }
    };

    void asyncCall();
  }, [categories, countryCode, searchTerms, type]);

  return { attributes, fetchError };
};
