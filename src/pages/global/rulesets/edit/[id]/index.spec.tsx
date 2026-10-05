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
    history: { changes: [], pagination: { totalItems: 0 } },
    isLoading: false,
    error: '',
  })),
}));

describe('Index', () => {
  const mockRouter = {
    push: jest.fn(),
    reload: jest.fn(),
    query: {},
    events: {
      on: jest.fn(),
      off: jest.fn(),
    },
  };

  beforeEach(() => {
    mockError = undefined;
    mockUpdateGlobalRuleSet = jest.fn(() =>
      Promise.resolve({ status: 'success' })
    );
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

  it('should show read-only banner for read-only users', async () => {
    renderWithProviders(<Page id={ruleSetId} />, ['Glob.R'], {
      featureFlags: {
        hasAuthorization: true,
      },
    });

    expect(
      await screen.findByText(/you're viewing this page in read-only mode/i, {
        exact: false,
      })
    ).toBeVisible();
    expect(
      screen.getByText(/request the "Glob.W" role/i, { exact: false })
    ).toBeVisible();
  });

  it('should not show read-only banner for write-enabled users', async () => {
    renderWithProviders(<Page id={ruleSetId} />, ['Glob.W'], {
      featureFlags: {
        hasAuthorization: true,
      },
    });

    await waitFor(() => {
      expect(
        screen.queryByText(/you're viewing this page in read-only mode/i, {
          exact: false,
        })
      ).not.toBeInTheDocument();
    });
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
      catalogue: 'CLOTHING_AND_HOME',
    };
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<Page id={ruleSetId} />);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: 'Review changes',
        })
      ).toBeVisible();
    });

    expect(
      screen.getByText(
        /This action will apply changes to all live pages on the M&S website and app/
      )
    ).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(mockUpdateGlobalRuleSet).toHaveBeenCalledWith(expectedRuleSet);
    expect(mockRouter.push).toHaveBeenCalledWith(
      '/global?catalogue=CLOTHING_AND_HOME'
    );
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
      catalogue: 'CLOTHING_AND_HOME',
    };
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<Page id={ruleSetId} />);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: 'Review changes',
        })
      ).toBeVisible();
    });

    await user.click(screen.getByRole('button', { name: 'Save changes' }));

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

    expect(mockRouter.push).toHaveBeenCalledWith(
      '/global?catalogue=CLOTHING_AND_HOME'
    );
  });

  it('saves ruleset against the CFTO catalogue when navigated to with a CFTO catalogue query param', async () => {
    jest.mocked(useGlobalRuleSetDetail).mockImplementation(() => {
      return {
        globalRuleSet: mockRuleData,
        isLoading: false,
        error: '',
      };
    });
    (useRouter as jest.Mock).mockReturnValue({
      ...mockRouter,
      query: { catalogue: 'CFTO' },
    });
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<Page id={ruleSetId} />);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: 'Review changes',
        })
      ).toBeVisible();
    });

    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(mockUpdateGlobalRuleSet).toHaveBeenCalledWith(
      expect.objectContaining({ catalogue: 'CFTO' })
    );
    expect(mockRouter.push).toHaveBeenCalledWith('/global?catalogue=CFTO');

    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  describe('Optimistic locking conflict', () => {
    const currentEntity: MerchandisingReturnedGlobalRuleSet = {
      ...mockRuleData,
      version: 7,
      lastChanged: { date: '2024-02-02T00:00:00Z', user: 'Other User' },
    };

    beforeEach(() => {
      mockError = undefined;
      jest.mocked(useGlobalRuleSetDetail).mockReturnValue({
        globalRuleSet: mockRuleData,
        error: '',
        isLoading: false,
      });
    });

    const openConflictModal = async () => {
      const user = userEvent.setup({ delay: null });

      renderWithProviders(<Page id={ruleSetId} />);

      await user.click(screen.getByRole('button', { name: 'Save' }));
      await user.click(
        await screen.findByRole('button', { name: 'Save changes' })
      );

      expect(
        await screen.findByRole('dialog', {
          name: 'This ruleset was changed by someone else',
        })
      ).toBeInTheDocument();

      return user;
    };

    it('shows the conflict modal on a 409', async () => {
      mockUpdateGlobalRuleSet = jest
        .fn()
        .mockResolvedValue({ status: 'conflict', currentEntity });

      await openConflictModal();

      expect(mockUpdateGlobalRuleSet).toHaveBeenCalled();
      expect(
        screen.getByRole('dialog', {
          name: 'This ruleset was changed by someone else',
        })
      ).toHaveTextContent('Other User');
      expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it('overwrites with the local changes using the server version', async () => {
      mockUpdateGlobalRuleSet = jest
        .fn()
        .mockResolvedValueOnce({ status: 'conflict', currentEntity })
        .mockResolvedValueOnce({ status: 'success' });

      const user = await openConflictModal();

      await user.click(
        screen.getByRole('button', { name: 'Overwrite with my changes' })
      );

      expect(mockUpdateGlobalRuleSet).toHaveBeenLastCalledWith(
        expect.objectContaining({ version: 7 })
      );
      await waitFor(() =>
        expect(mockRouter.push).toHaveBeenCalledWith(
          '/global?catalogue=CLOTHING_AND_HOME'
        )
      );
    });

    it('discards the local changes and reloads on discard', async () => {
      mockUpdateGlobalRuleSet = jest
        .fn()
        .mockResolvedValue({ status: 'conflict', currentEntity });

      const user = await openConflictModal();

      await user.click(
        screen.getByRole('button', { name: 'Discard my changes' })
      );

      expect(mockRouter.reload).toHaveBeenCalled();
    });

    it('dismisses the conflict modal without saving', async () => {
      mockUpdateGlobalRuleSet = jest
        .fn()
        .mockResolvedValue({ status: 'conflict', currentEntity });

      const user = await openConflictModal();

      await user.keyboard('{Escape}');

      await waitFor(() =>
        expect(
          screen.queryByRole('heading', {
            name: 'This ruleset was changed by someone else',
          })
        ).not.toBeInTheDocument()
      );
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
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
        history: { changes: [], pagination: { totalItems: 0 } },
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
        history: {
          changes: [mockHistoryChange],
          pagination: { totalItems: 1 },
        },
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
        history: {
          changes: [mockHistoryChange],
          pagination: { totalItems: 1 },
        },
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
        history: { changes: [], pagination: { totalItems: 0 } },
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
        history: { changes: [], pagination: { totalItems: 0 } },
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
        history: {
          changes: [mockHistoryChange],
          pagination: { totalItems: 1 },
        },
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
