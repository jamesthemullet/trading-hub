import type {
  GetMerchandisingAttributesParamsCatalogueEnum,
  MerchandisingCountryCode,
} from '@/libs/api';

export const convertCountryCodeToCatalogues = (
  countryCode: MerchandisingCountryCode
): GetMerchandisingAttributesParamsCatalogueEnum[] => {
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
): GetMerchandisingAttributesParamsCatalogueEnum =>
  categoryId.includes('IE_') ? 'MANDSIE' : 'MANDSUK';
