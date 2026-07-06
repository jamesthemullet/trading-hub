import type { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

import {
  defaultFeatureFlags,
  FeatureFlagContext,
  useAuthorizationFlag,
  useFavouriteRulesetsFlag,
  useProfilePageFlag,
  useStickyBarFlag,
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

describe('useStickyBarFlag', () => {
  it('should return defaults when flag is off', () => {
    const { result } = renderHook(() => useStickyBarFlag(), {
      wrapper: createWrapper(),
    });

    expect(result.current.stickyBarEnabled).toBe(false);
    expect(result.current.stickyBarVariant).toBe('variant-a');
  });

  it('should return enabled state and variant when flag is on', () => {
    const { result } = renderHook(() => useStickyBarFlag(), {
      wrapper: createWrapper({
        hasStickyBar: true,
        stickyBarVariant: 'variant-b',
      }),
    });

    expect(result.current.stickyBarEnabled).toBe(true);
    expect(result.current.stickyBarVariant).toBe('variant-b');
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
