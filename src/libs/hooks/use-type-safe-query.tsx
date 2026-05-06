import { useRouter } from 'next/router';

import type { MerchandisingCountryCode } from '../api';

export const useTypeSafeQuery = (): {
  getStringParam: (key: string) => string;
  getCountryCodeParam: (key: string) => MerchandisingCountryCode | undefined;
  getBooleanParam: (key: string) => boolean;
} => {
  const router = useRouter();

  const getStringParam = (key: string): string => {
    try {
      const value = router.query[key];
      if (typeof value === 'string') {
        return value;
      }
      return '';
    } catch {
      return '';
    }
  };

  const isValidCountryCode = (
    value: string
  ): value is MerchandisingCountryCode => {
    return value === 'UK' || value === 'IE' || value === 'UK_IE';
  };

  const getCountryCodeParam = (
    key: string
  ): MerchandisingCountryCode | undefined => {
    try {
      const value = router.query[key];
      if (typeof value === 'string' && isValidCountryCode(value)) {
        return value;
      }
      return undefined;
    } catch {
      return undefined;
    }
  };

  const getBooleanParam = (key: string): boolean => {
    try {
      return router.query[key] === 'true';
    } catch {
      return false;
    }
  };

  return { getStringParam, getCountryCodeParam, getBooleanParam };
};
