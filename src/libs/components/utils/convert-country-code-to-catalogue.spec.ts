import { convertCountryCodeToCatalogue } from './convert-country-code-to-catalogue';

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
