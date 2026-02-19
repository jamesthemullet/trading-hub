export const getFlagFromCountryCode = (
  countryCode: string | undefined
): { flags: string; alt: string }[] => {
  const createFlagObject = (code: string) => ({
    flags: `/trading-hub/asset/icon-${code.toLowerCase()}-flag.svg`,
    alt: `${code} rule`,
  });

  switch (countryCode) {
    case 'UK':
    case 'IE':
      return [createFlagObject(countryCode)];
    case 'UK_IE':
      return [createFlagObject('UK'), createFlagObject('IE')];
    default:
      return [];
  }
};
