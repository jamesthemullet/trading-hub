import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import { useSearchRuleSetCreate } from '@/libs/hooks';
import { facetsListMock } from '@/pages/api/search/mocks';
import { renderWithProviders } from '@/test/render-with-providers';

import NewFacetRuleset from './index.page';

const mockUseFacetsList = {
  isLoading: false,
  facets: facetsListMock.facets,
  error: '',
};

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/libs/hooks', () => ({
  ...jest.requireActual('@/libs/hooks'),
  useSearchRuleSetCreate: jest.fn(),
  useFacetsList: () => {
    return mockUseFacetsList;
  },
}));

jest.mock('@/libs/hooks/global/facets/use-global-facets-list', () => ({
  useGlobalFacetsList: () => ({
    facets: facetsListMock.facets,
    isLoading: false,
    error: '',
    onRefreshFacetList: jest.fn(),
  }),
}));

const NEW_RULE_BUTTON_TEXT = 'Create';

describe('Search Facet Management New', () => {
  const mockRouter = {
    push: jest.fn(),
    query: { id: 'test-ruleset-id' },
  };

  beforeEach(() => {
    jest.mocked(useSearchRuleSetCreate).mockReturnValue({
      createRuleset: jest.fn(),
      error: '',
    });
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render search ruleset facet editor', async () => {
    renderWithProviders(<NewFacetRuleset />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Facet Rule Editor' })
    ).toBeVisible();
  });

  it('should render the access denied page', async () => {
    renderWithProviders(<NewFacetRuleset />, [], {
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

    renderWithProviders(<NewFacetRuleset />);

    await user.click(screen.getAllByText('Exclude only')[0]);
    await waitFor(() => {
      expect(screen.getByTestId('Row showing color as excluded')).toBeVisible();
    });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    const confirmCancelButton = await screen.findByText('Close without saving');

    act(() => {
      confirmCancelButton.click();
    });

    expect(mockRouter.push).toHaveBeenCalledWith('/search');
  });

  it('should save changes to a newly created facet', async () => {
    const user = userEvent.setup();
    const createRuleset = jest.fn().mockResolvedValue({});
    jest.mocked(useSearchRuleSetCreate).mockReturnValue({
      createRuleset,
      error: '',
    });

    renderWithProviders(<NewFacetRuleset />);

    await waitFor(async () => {
      await user.click(screen.getByRole('button', { name: 'Edit' }));
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
    });

    const keywordInput = await screen.findByLabelText('Add keyword to list');
    await user.type(keywordInput, 'red dress{Enter}');

    await waitFor(() => {
      expect(
        screen.getByTestId('Row showing color as algoControl')
      ).toBeVisible();
    });

    const includeOnlyOption = screen.getAllByText('Include only')[0];

    await user.click(includeOnlyOption);
    await waitFor(() => {
      expect(screen.getByTestId('Row showing color as included')).toBeVisible();
    });

    const excludeOnlyOption = screen.getAllByText('Exclude only')[1];

    await user.click(excludeOnlyOption);
    await waitFor(() => {
      expect(screen.getByTestId('Row showing size as excluded')).toBeVisible();
    });

    const submit = await screen.findByText(NEW_RULE_BUTTON_TEXT);
    act(() => {
      submit.click();
    });

    await user.click(
      await screen.findByRole('button', { name: 'Save changes' })
    );

    expect(await screen.findByText(NEW_RULE_BUTTON_TEXT)).toBeInTheDocument();
    expect(createRuleset).toHaveBeenCalledWith({
      searchTerms: ['red dress'],
      countryCode: 'UK_IE',
      facets: [
        {
          id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
          boosted: [],
          excludedValues: [],
        },
      ],
      excludedFacets: {
        facets: [
          {
            id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a85',
          },
        ],
      },
      isEnabled: true,
      rules: {
        blockedProducts: [],
        boosts: { alphanumeric: [], numeric: [], product: [] },
        buries: { alphanumeric: [], numeric: [], product: [] },
        excludes: { alphanumeric: [] },
        includes: { alphanumeric: [] },
        pinnedProducts: [],
      },
    });
    expect(mockRouter.push).toHaveBeenCalledWith('/search');
  });

  describe('Scheduling', () => {
    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2022, 2, 1));
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('should save scheduling changes to a facet', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const createRuleset = jest.fn().mockResolvedValue({});
      jest.mocked(useSearchRuleSetCreate).mockReturnValue({
        createRuleset,
        error: '',
      });

      renderWithProviders(<NewFacetRuleset />);

      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: 'Edit' }));
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
      });
      const keywordInput = await screen.findByLabelText('Add keyword to list');
      await user.type(keywordInput, 'red dress{Enter}');

      expect(screen.getByText('Duration')).toBeVisible();

      const input = screen.getByPlaceholderText('Select date range');
      act(() => {
        input.click();
      });

      await waitFor(() => {
        expect(screen.getByText('On all the time')).toBeVisible();
      });

      const toggle = screen.getByRole('checkbox', {
        name: 'On all the time',
      });
      await user.click(toggle);

      const startDate = screen.getAllByText('16')[1];
      const endDate = screen.getAllByText('17')[1];

      // mantine update auto selects the current day so we need to click the start date twice
      act(() => {
        startDate.click();
      });
      act(() => {
        startDate.click();
      });

      act(() => {
        endDate.click();
      });

      const saveButton = screen.getByRole('button', {
        name: 'Close schedule editor',
      });

      act(() => {
        saveButton.click();
      });

      expect(screen.getByPlaceholderText('Select date range')).toHaveValue(
        '16/04/22 00:00 - 17/04/22 23:59'
      );

      const submit = await screen.findByText(NEW_RULE_BUTTON_TEXT);
      act(() => {
        submit.click();
      });

      act(() => {
        jest.runAllTimers();
      });

      const confirmButton = await screen.findByRole('button', {
        name: 'Save changes',
      });
      act(() => {
        confirmButton.click();
      });

      expect(createRuleset).toHaveBeenCalledWith({
        searchTerms: ['red dress'],
        endDate: '2022-04-17T23:59:00.000Z',
        startDate: '2022-04-16T00:00:00.000Z',
        countryCode: 'UK_IE',
        facets: [],
        excludedFacets: {
          facets: [],
        },
        isEnabled: true,
        rules: {
          blockedProducts: [],
          boosts: { alphanumeric: [], numeric: [], product: [] },
          buries: { alphanumeric: [], numeric: [], product: [] },
          excludes: { alphanumeric: [] },
          includes: { alphanumeric: [] },
          pinnedProducts: [],
        },
      });
    });
  });
});
