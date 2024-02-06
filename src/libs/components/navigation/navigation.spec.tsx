import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { signIn, signOut, useSession } from 'next-auth/react';

import { Navigation } from './navigation';

jest.mock('next-auth/react', () => ({
  ...jest.requireActual('next-auth/react'),
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

describe('Navigation', () => {
  it('should render trading hub navigation', () => {
    render(<Navigation />);

    expect(screen.getByTitle('Category Ranking Rules')).toBeInTheDocument();
  });

  it('should show Login when signed out', () => {
    render(<Navigation />);

    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('should call auth Login when signed out', async () => {
    render(<Navigation />);

    const user = userEvent.setup({ delay: null });
    await user.click(screen.getByText('Login'));

    expect(signIn).toHaveBeenCalled();
  });

  it('should show Login when authenticated', () => {
    jest.mocked(useSession).mockReturnValue({
      data: { expires: '' },
      status: 'authenticated',
      update: jest.fn(),
    });
    render(<Navigation />);

    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('should call auth logout when signed in', async () => {
    jest.mocked(useSession).mockReturnValue({
      data: { expires: '' },
      status: 'authenticated',
      update: jest.fn(),
    });
    render(<Navigation />);

    const user = userEvent.setup({ delay: null });
    await user.click(screen.getByText('Logout'));

    expect(signOut).toHaveBeenCalled();
  });
});
