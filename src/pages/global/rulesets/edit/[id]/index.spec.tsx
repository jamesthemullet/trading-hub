import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import type { MerchandisingReturnedGlobalRuleSet } from '@/libs/api';
import { useGlobalRuleSetDetail } from '@/libs/hooks';
import { useGlobalHistory } from '@/libs/hooks/global/history/use-global-history';
import { ruleSetId } from '@/test/data/mock-use-rule-set-preview.data';
import { renderWithProviders } from '@/test/render-with-providers';

import type { GetServerSidePropsContext } from 'next';
import type { ParsedUrlQuery } from 'querystring';

import Page, { getServerSideProps } from './index.page';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

let mockUpdateGlobalRuleSet = jest.fn(() =>
  Promise.resolve({ status: 'success' })
);
let mockError: string | undefined = undefined;
jest.mock('@/libs/hooks/global/rulesets/use-global-rule-set-update', () => ({
  useGlobalRuleSetUpdate: () => {
    return { saveGlobalRuleset: mockUpdateGlobalRuleSet, error: mockError };
  },
}));

const mockRuleData: MerchandisingReturnedGlobalRuleSet = {
  rules: {
    pinnedProducts: [],
    blockedProducts: [],
    boosts: { numeric: [], alphanumeric: [], product: [] },
    buries: { numeric: [], alphanumeric: [], product: [] },
    includes: {
      alphanumeric: [],
    },
    excludes: {
      alphanumeric: [],
    },
  },
  isEnabled: false,
  id: 'df70401f-f89d-45ad-92e7-6e152930ff86',
  lastChanged: { date: '2023-12-06T14:24:17Z', user: 'Mark Spencer' },
};

jest.mock('@/libs/hooks/global/rulesets/use-global-rule-set-detail', () => ({
  useGlobalRuleSetDetail: jest.fn(),
}));

jest.mock('@/libs/hooks/global/history/use-global-history', () => ({
  useGlobalHistory: jest.fn(() => ({
    history: { changes: [] },
    isLoading: false,
    error: '',
  })),
}));

describe('Index', () => {
  const mockRouter = {
    push: jest.fn(),
    query: {},
    events: {
      on: jest.fn(),
      off: jest.fn(),
    },
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.mocked(useGlobalRuleSetDetail).mockReturnValue({
      globalRuleSet: mockRuleData,
      error: '',
      isLoading: false,
    });
  });

  it('should show a loader before any data is fetched', async () => {
    jest.mocked(useGlobalRuleSetDetail).mockReturnValueOnce({
      globalRuleSet: mockRuleData,
      error: '',
      isLoading: true,
    });

    renderWithProviders(<Page id={ruleSetId} />);

    expect(screen.getByLabelText('loading content')).toBeInTheDocument();
  });

  it('should render the access denied page', async () => {
    jest.mocked(useGlobalRuleSetDetail).mockImplementation(() => {
      return {
        globalRuleSet: mockRuleData,
        isLoading: false,
        error: 'Access denied',
      };
    });

    renderWithProviders(<Page id={ruleSetId} />, [], {
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

  it('should save ruleset', async () => {
    jest.mocked(useGlobalRuleSetDetail).mockImplementation(() => {
      return {
        globalRuleSet: mockRuleData,
        isLoading: false,
        error: '',
      };
    });
    const expectedRuleSet = {
      ruleSet: {
        facets: [],
        isEnabled: false,
        rules: {
          blockedProducts: [],
          boosts: { alphanumeric: [], numeric: [], product: [] },
          buries: { alphanumeric: [], numeric: [], product: [] },
          pinnedProducts: [],
          includes: {
            alphanumeric: [],
          },
          excludes: {
            alphanumeric: [],
          },
        },
        countryCode: 'UK_IE',
      },
      ruleSetId: '090152b8-2517-4e42-a5f3-48fcab8d9942',
    };
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<Page id={ruleSetId} />);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: 'Apply global changes',
        })
      ).toBeVisible();
    });

    await user.click(screen.getByRole('button', { name: 'Apply action' }));

    expect(mockUpdateGlobalRuleSet).toHaveBeenCalledWith(expectedRuleSet);
    expect(mockRouter.push).toHaveBeenCalledWith('/global');
  });

  it('should not save ruleset with server errors', async () => {
    jest.mocked(useGlobalRuleSetDetail).mockImplementation(() => {
      return {
        globalRuleSet: mockRuleData,
        isLoading: false,
        error: '',
      };
    });
    mockError = 'Error message';
    mockUpdateGlobalRuleSet = jest.fn(() =>
      Promise.resolve({ status: 'error', error: 'Error message' })
    );

    const expectedRuleSet = {
      ruleSet: {
        facets: [],
        isEnabled: false,
        rules: {
          blockedProducts: [],
          boosts: { alphanumeric: [], numeric: [], product: [] },
          buries: { alphanumeric: [], numeric: [], product: [] },
          pinnedProducts: [],
          includes: {
            alphanumeric: [],
          },
          excludes: {
            alphanumeric: [],
          },
        },
        countryCode: 'UK_IE',
      },
      ruleSetId: '090152b8-2517-4e42-a5f3-48fcab8d9942',
    };
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<Page id={ruleSetId} />);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: 'Apply global changes',
        })
      ).toBeVisible();
    });

    await user.click(screen.getByRole('button', { name: 'Apply action' }));

    expect(mockUpdateGlobalRuleSet).toHaveBeenCalledWith(expectedRuleSet);

    expect(screen.getByText('Error message')).toBeVisible();
  });

  it('should cancel changes to a ruleset', async () => {
    jest.mocked(useGlobalRuleSetDetail).mockReturnValueOnce({
      globalRuleSet: mockRuleData,
      isLoading: false,
      error: '',
    });
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<Page id={ruleSetId} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockRouter.push).toHaveBeenCalledWith('/global');
  });

  it('should close the confirmation modal when cancel button on modal clicked', async () => {
    jest.mocked(useGlobalRuleSetDetail).mockImplementation(() => {
      return {
        globalRuleSet: mockRuleData,
        isLoading: false,
        error: '',
      };
    });

    const user = userEvent.setup({ delay: null });

    renderWithProviders(<Page id={ruleSetId} />);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: 'Apply global changes',
        })
      ).toBeVisible();
    });

    await user.click(
      screen.getByRole('button', { name: 'Close confirmation modal' })
    );

    expect(mockUpdateGlobalRuleSet).not.toHaveBeenCalled();
  });

  it('loads the mock data', async () => {
    const mockPageId = 'abc123';
    const context = { query: { id: mockPageId } as ParsedUrlQuery };
    const result = await getServerSideProps(
      context as GetServerSidePropsContext
    );

    if (!('props' in result) || !result.props) {
      throw new Error('No props returned');
    }

    expect((await result.props).id).toBe(mockPageId);
  });

  describe('History view', () => {
    const mockHistoryChange = {
      id: 'history-change-id',
      entityId: 'entity-id',
      savedAt: '2024-01-01T00:00:00Z',
      savedBy: 'test-user',
      schemaVersion: '1',
      change: {
        ...mockRuleData,
        id: 'historical-ruleset-id',
      },
    };

    beforeEach(() => {
      mockError = undefined;
      jest.mocked(useGlobalHistory).mockReturnValue({
        history: { changes: [] },
        isLoading: false,
        error: '',
      });
    });

    it('should render ruleset from history when history query param is true', async () => {
      (useRouter as jest.Mock).mockReturnValue({
        ...mockRouter,
        query: { history: 'true', historyId: 'history-change-id' },
      });

      jest.mocked(useGlobalHistory).mockReturnValue({
        history: { changes: [mockHistoryChange] },
        isLoading: false,
        error: '',
      });

      renderWithProviders(<Page id={ruleSetId} />);

      expect(
        await screen.findByRole('button', { name: 'Cancel' })
      ).toBeInTheDocument();
    });

    it('should disable write access when viewing history', async () => {
      (useRouter as jest.Mock).mockReturnValue({
        ...mockRouter,
        query: { history: 'true', historyId: 'history-change-id' },
      });

      jest.mocked(useGlobalHistory).mockReturnValue({
        history: { changes: [mockHistoryChange] },
        isLoading: false,
        error: '',
      });

      renderWithProviders(<Page id={ruleSetId} />);

      expect(
        await screen.findByRole('button', { name: 'Cancel' })
      ).toBeInTheDocument();

      expect(
        screen.queryByRole('button', { name: 'Save' })
      ).not.toBeInTheDocument();
    });

    it('should show loader when history is loading', () => {
      (useRouter as jest.Mock).mockReturnValue({
        ...mockRouter,
        query: { history: 'true', historyId: 'history-change-id' },
      });

      jest.mocked(useGlobalHistory).mockReturnValue({
        history: { changes: [] },
        isLoading: true,
        error: '',
      });

      renderWithProviders(<Page id={ruleSetId} />);

      expect(
        screen.getAllByLabelText('loading content').length
      ).toBeGreaterThan(0);
    });

    it('should show history error when present', () => {
      (useRouter as jest.Mock).mockReturnValue({
        ...mockRouter,
        query: { history: 'true', historyId: 'history-change-id' },
      });

      jest.mocked(useGlobalHistory).mockReturnValue({
        history: { changes: [] },
        isLoading: false,
        error: 'Failed to load history',
      });

      renderWithProviders(<Page id={ruleSetId} />);

      expect(screen.getByText('Failed to load history')).toBeInTheDocument();
    });

    it('should not render ruleset when historyId does not match any change', () => {
      (useRouter as jest.Mock).mockReturnValue({
        ...mockRouter,
        query: { history: 'true', historyId: 'non-existent-id' },
      });

      jest.mocked(useGlobalHistory).mockReturnValue({
        history: { changes: [mockHistoryChange] },
        isLoading: false,
        error: '',
      });

      renderWithProviders(<Page id={ruleSetId} />);

      expect(
        screen.queryByRole('button', { name: 'Cancel' })
      ).not.toBeInTheDocument();
    });
  });
});
