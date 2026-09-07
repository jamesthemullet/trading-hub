import { useEffect, useState } from 'react';

import type {
  MerchandisingAttributeResponseItem,
  MerchandisingAttributesResponse,
  MerchandisingAttributeType,
  MerchandisingCountryCode,
} from '@/libs/api';
import { search } from '@/libs/api';

import uniqBy from 'lodash/uniqBy';

import {
  convertCategoryIdToCatalogue,
  convertCountryCodeToCatalogues,
} from '../utils/convert-country-code-to-catalogues';

type Props = {
  countryCode: MerchandisingCountryCode;
  type: MerchandisingAttributeType;
  categories?: string[];
  searchTerms?: string[];
};

export const useAttributes = ({
  categories,
  countryCode,
  searchTerms,
  type,
}: Props): {
  attributes: MerchandisingAttributeResponseItem[];
  fetchError: string;
} => {
  const [attributes, setAttributes] = useState<
    MerchandisingAttributesResponse['attributes']
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
                .getMerchandisingAttributes({
                  categoryId,
                  type,
                  catalogue: convertCategoryIdToCatalogue(categoryId),
                })
                .then((response) => response.data.attributes)
            )
          : catalogues.map((catalogue) =>
              search()
                .getMerchandisingAttributes({
                  searchTerm: searchTerms,
                  type,
                  catalogue,
                })
                .then((response) => response.data.attributes)
            );

        const results = await Promise.all(promises);

        // merge and combine values of each attribute
        const mergedAttributes: Array<MerchandisingAttributeResponseItem> = [];
        results.forEach((returnedAttributes) => {
          returnedAttributes.forEach((attr) => {
            const index = mergedAttributes.findIndex(
              (mergedAttribute) => mergedAttribute.name === attr.name
            );
            if (index > -1) {
              // eslint-disable-next-line functional/immutable-data
              mergedAttributes[index].values = [
                ...(mergedAttributes[index].values ?? []),
                ...(attr.values ?? []),
              ];
            } else {
              // eslint-disable-next-line functional/immutable-data
              mergedAttributes.push(attr);
            }
          });
        });

        const attributesWithDedupedValues = mergedAttributes.map(
          (attribute) => {
            return {
              ...attribute,
              values: uniqBy(attribute.values, 'value'),
            };
          }
        );

        setAttributes(attributesWithDedupedValues);
      } catch (err) {
        setFetchError(`Error: ${err}`);
      }
    };

    void asyncCall();
  }, [categories, countryCode, searchTerms, type]);

  return { attributes, fetchError };
};
