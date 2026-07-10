import { act } from 'react';

import { renderWithProviders } from '@/test/render-with-providers';

import { signIn, useSession } from 'next-auth/react';

import { LoginCheck } from './login-check';

jest.mock('next-auth/react', () => ({
  ...jest.requireActual('next-auth/react'),
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));
jest.useFakeTimers();

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

    renderWithProviders(<LoginCheck shouldAutoLogin />);

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

  it('should update session at regular intervals', () => {
    const mockUpdate = jest.fn();

    jest.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: mockUpdate,
    });

    renderWithProviders(<LoginCheck />);

    expect(mockUpdate).not.toHaveBeenCalled();

    jest.runOnlyPendingTimers();

    expect(mockUpdate).toHaveBeenCalled();
  });

  it('should update session at visibility change', () => {
    const mockUpdate = jest.fn();

    jest.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: mockUpdate,
    });

    renderWithProviders(<LoginCheck />);

    expect(mockUpdate).not.toHaveBeenCalled();

    act(() => {
      window.dispatchEvent(new Event('visibilitychange'));
    });

    expect(mockUpdate).toHaveBeenCalled();
  });
});
