import { CountryCode } from '@/libs/api';

import {
  convertCategoryIdToCatalogue,
  convertCountryCodeToCatalogues,
} from './convert-country-code-to-catalogues';

describe('convertCountryCodeToCatalogues', () => {
  it.each([
    ['UK', ['MANDSUK']],
    ['IE', ['MANDSIE']],
    ['UK_IE', ['MANDSUK', 'MANDSIE']],
  ])(
    'should convert %s country code to %s catalogue(s)',
    (countryCode, expectedCatalogues) => {
      const catalogues = convertCountryCodeToCatalogues(
        countryCode as CountryCode
      );
      expect(catalogues).toStrictEqual(expectedCatalogues);
    }
  );
});

describe('convertCategoryIdToCatalogue', () => {
  it.each([
    ['SubCategory_429', 'MANDSUK'],
    ['IE_SubCategory_505', 'MANDSIE'],
  ])(
    'should convert %s category ids to %s catalogue(s)',
    (categories, expectedCatalogue) => {
      const catalogues = convertCategoryIdToCatalogue(categories);
      expect(catalogues).toStrictEqual(expectedCatalogue);
    }
  );
});
