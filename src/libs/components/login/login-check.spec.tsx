import { renderWithProviders } from '@/test/render-with-providers';

import { signIn, useSession } from 'next-auth/react';

import { LoginCheck } from './login-check';

jest.mock('next-auth/react', () => ({
  ...jest.requireActual('next-auth/react'),
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

describe('Login check', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should redirect when unauthenticated', () => {
    jest.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    });

    renderWithProviders(<LoginCheck autoLogin />);

    expect(signIn).toHaveBeenCalledWith('azure-ad');
  });

  it('should not redirect when autoLogin is missing', () => {
    jest.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    });

    renderWithProviders(<LoginCheck />);

    expect(signIn).not.toHaveBeenCalled();
  });
});
