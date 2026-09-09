import type {
  MerchandisingCountryCode,
  SearchMerchandisingProductsV1ParamsCountryEnum,
} from '@/libs/api';

export const convertCountryCodeToCountries = (
  countryCode: MerchandisingCountryCode
): SearchMerchandisingProductsV1ParamsCountryEnum[] => {
  switch (countryCode) {
    case 'UK':
      return ['UK'];
    case 'IE':
      return ['IE'];
    case 'UK_IE':
      return ['UK', 'IE'];
  }
};

export const convertCategoryIdToCountry = (
  categoryId: string
): SearchMerchandisingProductsV1ParamsCountryEnum =>
  categoryId.includes('IE_') ? 'IE' : 'UK';
