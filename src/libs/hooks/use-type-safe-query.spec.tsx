import { renderHook } from '@testing-library/react';
import { useRouter } from 'next/router';

import { useTypeSafeQuery } from './use-type-safe-query';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const mockRouter = {
  query: {},
  push: jest.fn(),
};

describe('useTypeSafeQuery', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getStringParam', () => {
    it('should return empty string for non-existent string param', () => {
      const { result } = renderHook(() => useTypeSafeQuery());

      expect(result.current.getStringParam('nonExistent')).toBe('');
    });

    it('should return the string value for existing string param', () => {
      mockRouter.query = { testParam: 'testValue' };
      const { result } = renderHook(() => useTypeSafeQuery());
      expect(result.current.getStringParam('testParam')).toBe('testValue');
    });

    it('should return empty string for array param when expecting string', () => {
      mockRouter.query = { testParam: ['value1', 'value2'] };
      const { result } = renderHook(() => useTypeSafeQuery());
      expect(result.current.getStringParam('testParam')).toBe('');
    });

    it('should return empty string when router.query access throws error', () => {
      const errorRouter = {
        get query() {
          throw new Error('Query access failed');
        },
        push: jest.fn(),
      };

      (useRouter as jest.Mock).mockReturnValue(errorRouter);

      const { result } = renderHook(() => useTypeSafeQuery());
      expect(result.current.getStringParam('testParam')).toBe('');
    });
  });

  describe('getCountryCodeParam', () => {
    it('should return undefined for non-existent country code param', () => {
      const { result } = renderHook(() => useTypeSafeQuery());
      expect(result.current.getCountryCodeParam('nonExistent')).toBeUndefined();
    });

    it('should return valid country code for UK', () => {
      mockRouter.query = { countryCode: 'UK' };
      const { result } = renderHook(() => useTypeSafeQuery());
      expect(result.current.getCountryCodeParam('countryCode')).toBe('UK');
    });

    it('should return valid country code for IE', () => {
      mockRouter.query = { countryCode: 'IE' };
      const { result } = renderHook(() => useTypeSafeQuery());
      expect(result.current.getCountryCodeParam('countryCode')).toBe('IE');
    });

    it('should return valid country code for UK_IE', () => {
      mockRouter.query = { countryCode: 'UK_IE' };
      const { result } = renderHook(() => useTypeSafeQuery());
      expect(result.current.getCountryCodeParam('countryCode')).toBe('UK_IE');
    });

    it('should return undefined for array value when expecting country code', () => {
      mockRouter.query = { countryCode: ['UK', 'IE'] };
      const { result } = renderHook(() => useTypeSafeQuery());
      expect(result.current.getCountryCodeParam('countryCode')).toBeUndefined();
    });

    it('should return undefined when router.query access throws error for country code param', () => {
      const errorRouter = {
        get query() {
          throw new Error('Query access failed');
        },
        push: jest.fn(),
      };

      (useRouter as jest.Mock).mockReturnValue(errorRouter);

      const { result } = renderHook(() => useTypeSafeQuery());
      expect(result.current.getCountryCodeParam('countryCode')).toBeUndefined();
    });
  });
});
