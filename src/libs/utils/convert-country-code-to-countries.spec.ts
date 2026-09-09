import type {
  MerchandisingCountryCode,
  SearchMerchandisingProductsV1ParamsCountryEnum,
} from '@/libs/api';

import {
  convertCategoryIdToCountry,
  convertCountryCodeToCountries,
} from './convert-country-code-to-countries';

describe('convertCountryCodeToCountries', () => {
  it.each<
    [MerchandisingCountryCode, SearchMerchandisingProductsV1ParamsCountryEnum[]]
  >([
    ['UK', ['UK']],
    ['IE', ['IE']],
    ['UK_IE', ['UK', 'IE']],
  ])(
    'should convert %s country code to %s country/countries',
    (countryCode, expectedCountries) => {
      const countries = convertCountryCodeToCountries(countryCode);
      expect(countries).toStrictEqual(expectedCountries);
    }
  );
});

describe('convertCategoryIdToCountry', () => {
  it.each([
    ['SubCategory_429', 'UK'],
    ['IE_SubCategory_505', 'IE'],
  ])(
    'should convert %s category ids to %s country',
    (categories, expectedCountry) => {
      const country = convertCategoryIdToCountry(categories);
      expect(country).toStrictEqual(expectedCountry);
    }
  );
});
