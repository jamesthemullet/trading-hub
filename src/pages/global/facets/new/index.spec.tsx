import { act } from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import { useGlobalRuleSetCreate } from '@/libs/hooks';
import { facetsListMock } from '@/pages/api/search/mocks';

import { renderWithProviders } from '../../../../test/render-with-providers';
import Page from './index.page';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/libs/hooks', () => ({
  ...jest.requireActual('@/libs/hooks'),
  useGlobalRuleSetCreate: jest.fn(),
  useFacetsList: () => ({
    isLoading: false,
    facets: facetsListMock.facets,
    error: '',
  }),
}));

describe('Global Facet Management New', () => {
  const mockRouter = {
    push: jest.fn(),
    query: { id: 'test-ruleset-id' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useGlobalRuleSetCreate).mockReturnValue({
      createGlobalRuleSet: jest.fn(),
      error: '',
    });

    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('should render global ruleset facet editor', async () => {
    renderWithProviders(<Page />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Global Facet Rule Editor',
      })
    ).toBeVisible();
  });

  it('should render the access denied page', async () => {
    renderWithProviders(<Page />, [], {
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

  it('should cancel changes to a facet', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<Page />);

    await user.click(screen.getAllByText('Exclude only')[0]);
    await waitFor(() => {
      expect(screen.getByTestId('Row showing color as excluded')).toBeVisible();
    });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    const confirmCancelButton = await screen.findByText('Close without saving');

    act(() => {
      confirmCancelButton.click();
    });

    expect(mockRouter.push).toHaveBeenCalledWith('/global');
  });

  it('should handle save action and create new global ruleset', async () => {
    const user = userEvent.setup();
    const createGlobalRuleSet = jest.fn().mockResolvedValue({});
    jest.mocked(useGlobalRuleSetCreate).mockReturnValue({
      createGlobalRuleSet,
      error: '',
    });
    renderWithProviders(<Page />);

    const createButton = screen.getByRole('button', { name: /create/i });
    await user.click(createButton);

    expect(createGlobalRuleSet).toHaveBeenCalled();

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/global');
    });
  });
});
