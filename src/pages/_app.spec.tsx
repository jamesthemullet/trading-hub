import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';

import { useSession } from 'next-auth/react';

import { createMockNextRouter } from '../test/create-mock-next-router';
import App from './_app.page';

jest.mock('next-auth/react', () => ({
  ...jest.requireActual('next-auth/react'),
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

const mockSession = {
  expires: new Date(Date.now() + 2 * 86400).toISOString(),
  user: { id: '', userName: 'Test User' },
  roles: [],
  accessToken: '',
  refreshToken: '',
  accessTokenExpires: 2237303552,
};

describe('App', () => {
  it('renders with children', () => {
    jest.mocked(useSession).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: jest.fn(),
    });
    render(
      <App
        Component={() => <div>hello</div>}
        pageProps={{
          session: null,
        }}
        router={createMockNextRouter()}
      />
    );

    expect(screen.getByText('hello')).toBeInTheDocument();
  });
});
