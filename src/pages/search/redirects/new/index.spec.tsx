import { act } from 'react-dom/test-utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import { useRedirectCreate } from '@/libs/hooks/search/redirect/use-redirect-create';
import { returnedRedirectMock } from '@/pages/api/search/mocks';
import { renderWithProviders } from '@/test/render-with-providers';

import NewRedirect from './index.page';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('@/libs/hooks/search/redirect/use-redirect-create', () => ({
  useRedirectCreate: jest.fn(),
}));

const createRedirect = jest.fn(() =>
  Promise.resolve({
    ...returnedRedirectMock,
  })
);

describe('Create new redirect', () => {
  const mockCreateRuleset = {
    createRedirect,
    isSaving: false,
    error: '',
  };

  const mockRouter = {
    push: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
    },
  };

  beforeAll(() => {
    jest.mocked(useRedirectCreate).mockImplementation(() => mockCreateRuleset);
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('renders', async () => {
    renderWithProviders(<NewRedirect />);

    expect(screen.getByText('Add Keyword Redirect rule')).toBeVisible();
  });

  it('should cancel changes to a ruleset', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<NewRedirect />);

    await user.click(screen.getByText('Cancel'));

    expect(mockRouter.push).toHaveBeenCalledWith('/search/redirects');
  });

  it('should show an error', async () => {
    const errorMessage = 'my error message';
    jest.mocked(useRedirectCreate).mockImplementation(() => ({
      ...mockCreateRuleset,
      error: errorMessage,
    }));

    renderWithProviders(<NewRedirect />);

    expect(screen.getByText(errorMessage)).toBeVisible();
  });

  it('shows a loader when saving', async () => {
    jest.mocked(useRedirectCreate).mockImplementation(() => ({
      ...mockCreateRuleset,
      isSaving: true,
    }));

    renderWithProviders(<NewRedirect />);

    expect(screen.getByLabelText('loader')).toBeInTheDocument();
  });

  it('should create a new redirect', async () => {
    jest.mocked(useRedirectCreate).mockImplementation(() => ({
      ...mockCreateRuleset,
    }));

    const expectedCall = {
      redirect: {
        destinationUrl: 'c/redirect-url',
        isEnabled: true,
        keywords: ['new keyword'],
        ruleTitle: 'title',
        type: 'redirectTerm',
      },
    };

    const user = userEvent.setup({ delay: null });

    renderWithProviders(<NewRedirect />);

    const redirectUrl = await screen.findByPlaceholderText('c/');

    await act(async () => {
      user.type(redirectUrl, 'c/redirect-url');
    });

    act(() => {
      user.type(screen.getByLabelText('Add keyword'), 'new keyword{enter}');
    });

    const redirectTitle = await screen.findByPlaceholderText(
      'Enter redirect title'
    );

    await act(async () => {
      user.type(redirectTitle, 'title');
    });

    const createButton = await screen.findByRole('button', { name: 'Create' });

    act(() => {
      createButton.click();
    });

    expect(createRedirect).toHaveBeenCalledWith(expectedCall);
  });
});
