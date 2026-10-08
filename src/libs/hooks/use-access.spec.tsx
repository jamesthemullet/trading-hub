import { renderHook } from '@testing-library/react';

import { useSession } from 'next-auth/react';

import { useAccess } from './use-access';

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

describe('useAccess', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    ['Cat', 'Cat.W'],
    ['Search', 'Search.W'],
    ['Glob', 'Glob.W'],
  ] as const)(
    'grants read and write access for %s write role',
    (type, role) => {
      jest.mocked(useSession).mockReturnValue({
        data: {
          user: { id: 'userId', email: '' },
          roles: [role],
          expires: '',
          accessTokenExpires: 123,
        },
        update: async () => null,
        status: 'authenticated',
      });

      const { result } = renderHook(() => useAccess(type));

      expect(result.current.hasReadAccess).toBe(true);
      expect(result.current.hasWriteAccess).toBe(true);
      expect(result.current.requiredReadRole).toBe(`${type}.R`);
      expect(result.current.requiredWriteRole).toBe(`${type}.W`);
    }
  );

  it.each([
    ['Cat', 'Cat.R'],
    ['Search', 'Search.R'],
    ['Glob', 'Glob.R'],
  ] as const)('grants read-only access for %s read role', (type, role) => {
    jest.mocked(useSession).mockReturnValue({
      data: {
        user: { id: 'userId', email: '' },
        roles: [role],
        expires: '',
        accessTokenExpires: 123,
      },
      update: async () => null,
      status: 'authenticated',
    });

    const { result } = renderHook(() => useAccess(type));

    expect(result.current.hasReadAccess).toBe(true);
    expect(result.current.hasWriteAccess).toBe(false);
  });

  it.each([{ roles: [] }, { roles: ['Search.W'] }])(
    'denies access when the session does not grant the requested role',
    ({ roles }) => {
      jest.mocked(useSession).mockReturnValue({
        data: {
          user: { id: 'userId', email: '' },
          roles,
          expires: '',
          accessTokenExpires: 123,
        },
        update: async () => null,
        status: 'authenticated',
      });

      const { result } = renderHook(() => useAccess('Cat'));

      expect(result.current.hasReadAccess).toBe(false);
      expect(result.current.hasWriteAccess).toBe(false);
    }
  );

  it('denies access when there is no session', () => {
    jest.mocked(useSession).mockReturnValue({
      data: null,
      update: async () => null,
      status: 'unauthenticated',
    });

    const { result } = renderHook(() => useAccess('Cat'));

    expect(result.current.hasReadAccess).toBe(false);
    expect(result.current.hasWriteAccess).toBe(false);
  });
});
