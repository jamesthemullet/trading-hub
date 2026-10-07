import { useEffect, useState } from 'react';

import type {
  GetMerchandisingAttributesV1ParamsEnum,
  MerchandisingAttributeResponseItem,
  MerchandisingAttributesResponse,
  MerchandisingAttributeType,
  MerchandisingCountryCode,
} from '@/libs/api';
import { search } from '@/libs/api';

import groupBy from 'lodash/groupBy';
import uniqBy from 'lodash/uniqBy';

import {
  convertCategoryIdToCountry,
  convertCountryCodeToCountries,
} from '../utils/convert-country-code-to-countries';

type Props = {
  countryCode: MerchandisingCountryCode;
  type: MerchandisingAttributeType;
  catalogue?: GetMerchandisingAttributesV1ParamsEnum;
  categories?: string[];
  searchTerms?: string[];
};

export const useAttributes = ({
  categories,
  catalogue = 'CLOTHING_AND_HOME',
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

        const countries = convertCountryCodeToCountries(countryCode);
        const promises = categories?.length
          ? categories.map((categoryId) =>
              search()
                .getMerchandisingAttributesV1(catalogue, {
                  categoryId,
                  type,
                  country: convertCategoryIdToCountry(categoryId),
                })
                .then((response) => response.data.attributes)
            )
          : countries.map((country) =>
              search()
                .getMerchandisingAttributesV1(catalogue, {
                  searchTerm: searchTerms,
                  type,
                  country,
                })
                .then((response) => response.data.attributes)
            );

        const results = await Promise.all(promises);

        const returnedAttributes = results.flat();
        const attributesByName = groupBy(returnedAttributes, 'name');
        const uniqueAttributes = uniqBy(returnedAttributes, 'name');

        const attributesWithDedupedValues = uniqueAttributes.map(
          (attribute) => ({
            ...attribute,
            values: uniqBy(
              attributesByName[attribute.name].flatMap(
                ({ values }) => values ?? []
              ),
              'value'
            ),
          })
        );

        setAttributes(attributesWithDedupedValues);
      } catch (err) {
        setFetchError(`Error: ${err}`);
      }
    };

    void asyncCall();
  }, [categories, catalogue, countryCode, searchTerms, type]);

  return { attributes, fetchError };
};
