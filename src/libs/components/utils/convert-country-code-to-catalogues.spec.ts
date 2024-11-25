import { CountryCode } from '@/libs/api';

import { convertCountryCodeToCatalogues } from './convert-country-code-to-catalogues';

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
