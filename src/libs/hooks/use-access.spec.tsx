import { renderHook } from '@testing-library/react';

import { useSession } from 'next-auth/react';

import {
  defaultFeatureFlags,
  FeatureFlagContext,
} from '../components/context/feature-flag';
import { useAccess } from './use-access';

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

describe('useAccess', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useSession).mockReturnValue({
      data: {
        user: {
          id: 'userId',
          email: '',
        },
        roles: ['write'],
        expires: '',
        accessTokenExpires: 123,
      },
      update: async () => null,
      status: 'authenticated',
    });
  });

  it('should return hasReadAccess=true and hasWriteAccess=true', () => {
    const { result } = renderHook(
      () => useAccess({ readRole: 'read', writeRole: 'write' }),
      {
        wrapper: ({ children }) => (
          <FeatureFlagContext.Provider
            value={{
              ...defaultFeatureFlags,
              hasAuthorization: true,
            }}
          >
            {children}
          </FeatureFlagContext.Provider>
        ),
      }
    );

    expect(result.current.hasReadAccess).toBe(true);
    expect(result.current.hasWriteAccess).toBe(true);
  });

  it('should return hasReadAccess=true and hasWriteAccess=false', () => {
    jest.mocked(useSession).mockReturnValue({
      data: {
        user: {
          id: 'userId',
          email: '',
        },
        roles: ['read'],
        expires: '',
        accessTokenExpires: 123,
      },
      update: async () => null,
      status: 'authenticated',
    });

    const { result } = renderHook(
      () => useAccess({ readRole: 'read', writeRole: 'write' }),
      {
        wrapper: ({ children }) => (
          <FeatureFlagContext.Provider
            value={{
              ...defaultFeatureFlags,
              hasAuthorization: true,
            }}
          >
            {children}
          </FeatureFlagContext.Provider>
        ),
      }
    );

    expect(result.current.hasReadAccess).toBe(true);
    expect(result.current.hasWriteAccess).toBe(false);
  });

  it('should work with no session', () => {
    jest.mocked(useSession).mockReturnValue({
      data: null,
      update: async () => null,
      status: 'unauthenticated',
    });

    const { result } = renderHook(
      () => useAccess({ readRole: 'read', writeRole: 'write' }),
      {
        wrapper: ({ children }) => (
          <FeatureFlagContext.Provider
            value={{
              ...defaultFeatureFlags,
              hasAuthorization: true,
            }}
          >
            {children}
          </FeatureFlagContext.Provider>
        ),
      }
    );

    expect(result.current.hasReadAccess).toBe(false);
    expect(result.current.hasWriteAccess).toBe(false);
  });

  it('should work with no authorization flag enabled', () => {
    jest.mocked(useSession).mockReturnValue({
      data: {
        user: {
          id: 'userId',
          email: '',
        },
        roles: ['read'],
        expires: '',
        accessTokenExpires: 123,
      },
      update: async () => null,
      status: 'authenticated',
    });

    const { result } = renderHook(
      () => useAccess({ readRole: 'read', writeRole: 'write' }),
      {
        wrapper: ({ children }) => (
          <FeatureFlagContext.Provider
            value={{
              ...defaultFeatureFlags,
              hasAuthorization: false,
            }}
          >
            {children}
          </FeatureFlagContext.Provider>
        ),
      }
    );

    expect(result.current.hasReadAccess).toBe(true);
    expect(result.current.hasWriteAccess).toBe(true);
  });
});
