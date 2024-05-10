import { signIn, useSession } from 'next-auth/react';

import { renderWithProviders } from '@/test/render-with-providers';

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

    renderWithProviders(<LoginCheck />);

    expect(signIn).toHaveBeenCalledWith('azure-ad', {
      callbackUrl: '/rules',
      redirect: false,
    });
  });
});
