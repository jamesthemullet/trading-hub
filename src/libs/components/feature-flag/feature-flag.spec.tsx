import type { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

import {
  defaultFeatureFlags,
  FeatureFlagContext,
  useAuthorizationFlag,
  useFavouriteRulesetsFlag,
  useOptimisticLockingFlag,
  useProfilePageFlag,
} from './feature-flag';

const createWrapper = (overrides: Partial<typeof defaultFeatureFlags> = {}) => {
  const FeatureFlagTestWrapper = ({ children }: { children: ReactNode }) => (
    <FeatureFlagContext.Provider
      value={{ ...defaultFeatureFlags, ...overrides }}
    >
      {children}
    </FeatureFlagContext.Provider>
  );

  FeatureFlagTestWrapper.displayName = 'FeatureFlagTestWrapper';

  return FeatureFlagTestWrapper;
};

describe('useAuthorizationFlag', () => {
  it('should return the default feature flags', () => {
    const { result } = renderHook(() => useAuthorizationFlag(), {
      wrapper: createWrapper(),
    });

    expect(result.current).toBe(false);
  });
});

describe('useProfilePageFlag', () => {
  it('should return false by default', () => {
    const { result } = renderHook(() => useProfilePageFlag(), {
      wrapper: createWrapper(),
    });

    expect(result.current).toBe(false);
  });

  it('should return true when flag is enabled', () => {
    const { result } = renderHook(() => useProfilePageFlag(), {
      wrapper: createWrapper({ hasProfilePage: true }),
    });

    expect(result.current).toBe(true);
  });
});

describe('useFavouriteRulesetsFlag', () => {
  it('should return false by default', () => {
    const { result } = renderHook(() => useFavouriteRulesetsFlag(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <FeatureFlagContext.Provider value={defaultFeatureFlags}>
          {children}
        </FeatureFlagContext.Provider>
      ),
    });
    expect(result.current).toBe(false);
  });

  it('should return true when flag is enabled', () => {
    const { result } = renderHook(() => useFavouriteRulesetsFlag(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <FeatureFlagContext.Provider
          value={{ ...defaultFeatureFlags, hasFavouriteRulesets: true }}
        >
          {children}
        </FeatureFlagContext.Provider>
      ),
    });
    expect(result.current).toBe(true);
  });
});

describe('useOptimisticLockingFlag', () => {
  it('should return false by default', () => {
    const { result } = renderHook(() => useOptimisticLockingFlag(), {
      wrapper: createWrapper(),
    });

    expect(result.current).toBe(false);
  });

  it('should return true when flag is enabled', () => {
    const { result } = renderHook(() => useOptimisticLockingFlag(), {
      wrapper: createWrapper({ hasOptimisticLocking: true }),
    });

    expect(result.current).toBe(true);
  });
});
