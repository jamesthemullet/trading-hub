export const convertCountryCodeToCatalogue = (countryCode: string) => {
  switch (countryCode) {
    case 'UK':
      return 'MANDSUK';
    case 'IE':
      return 'MANDSIE';
    default:
      return undefined;
  }
};
