import { CountryCode } from '@/libs/api';

import {
  convertCountryCodeToCatalogue,
  convertCountryCodeToCatalogues,
} from './convert-country-code-to-catalogue';

describe('convertCountryCodeToCatalogue', () => {
  it.each([
    ['UK', 'MANDSUK'],
    ['IE', 'MANDSIE'],
    ['US', undefined],
  ])(
    'should convert %s country code to %s catalogue',
    (countryCode, expectedCatalogue) => {
      const catalogue = convertCountryCodeToCatalogue(countryCode);
      expect(catalogue).toBe(expectedCatalogue);
    }
  );
});

describe('convertCountryCodeToCatalogues', () => {
  it.each([
    ['UK', ['MANDSUK']],
    ['IE', ['MANDSIE']],
    ['UK_IE', ['MANDSUK', 'MANDSIE']],
  ])(
    'should convert %s country code to %s catalogue(s)',
    (countryCode, expectedCatalogue) => {
      const catalogues = convertCountryCodeToCatalogues(
        countryCode as CountryCode
      );
      expect(catalogues).toStrictEqual(expectedCatalogue);
    }
  );
});
