import {
  BetaMerchandisingAttributesListParamsCatalogueEnum,
  CountryCode,
} from '@/libs/api';

export const convertCountryCodeToCatalogues = (
  countryCode: CountryCode
): BetaMerchandisingAttributesListParamsCatalogueEnum[] => {
  switch (countryCode) {
    case 'UK':
      return ['MANDSUK'];
    case 'IE':
      return ['MANDSIE'];
    case 'UK_IE':
      return ['MANDSUK', 'MANDSIE'];
  }
};
