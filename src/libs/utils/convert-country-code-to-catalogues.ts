import type {
  BetaMerchandisingAttributesListParamsCatalogueEnum,
  MerchandisingCountryCode,
} from '@/libs/api';

export const convertCountryCodeToCatalogues = (
  countryCode: MerchandisingCountryCode
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

export const convertCategoryIdToCatalogue = (
  categoryId: string
): BetaMerchandisingAttributesListParamsCatalogueEnum =>
  categoryId.includes('IE_') ? 'MANDSIE' : 'MANDSUK';
