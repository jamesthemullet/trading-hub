import { act, screen, waitFor } from '@testing-library/react';
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

  it('should render the access denied page', async () => {
    renderWithProviders(<NewRedirect />, [], {
      featureFlags: {
        hasAuthorization: true,
      },
    });

    expect(
      screen.getByText('please contact admin on our teams channel', {
        exact: false,
      })
    ).toBeVisible();
  });

  it('should cancel changes to a ruleset', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<NewRedirect />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

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

    expect(screen.getByLabelText('loading content')).toBeInTheDocument();
  });

  it('should create a new redirect', async () => {
    jest.mocked(useRedirectCreate).mockImplementation(() => ({
      ...mockCreateRuleset,
    }));

    const expectedCall = {
      redirect: {
        destinationUrl: 'c/redirect-url',
        endDate: '',
        isEnabled: true,
        keywords: ['new keyword'],
        ruleTitle: 'title',
        startDate: '',
        type: 'redirectTerm',
        countryCode: 'UK_IE',
      },
    };

    const user = userEvent.setup({ delay: null });

    renderWithProviders(<NewRedirect />);
    const modalButton = await screen.findByRole('button', {
      name: 'Edit',
    });

    act(() => {
      modalButton.click();
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
    });

    const inputBox = screen.getByLabelText('Add keyword to list');

    act(() => {
      user.type(inputBox, 'new keyword{enter}');
    });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Remove keyword: new keyword' })
      ).toBeVisible();
    });

    const closeButton = screen.getByRole('button', { name: 'Close' });

    act(() => {
      user.click(closeButton);
    });

    const redirectTitle = await screen.findByPlaceholderText(
      'Enter redirect title'
    );

    await act(async () => {
      user.type(redirectTitle, 'title');
    });

    const redirectUrl = await screen.findByPlaceholderText('c/');

    act(() => {
      user.type(redirectUrl, 'c/redirect-url');
    });

    const createButton = await screen.findByRole('button', { name: 'Create' });

    act(() => {
      createButton.click();
    });

    expect(createRedirect).toHaveBeenCalledWith(expectedCall);
  });
});
