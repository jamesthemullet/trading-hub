import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import { useRedirectDetail, useRedirectUpdate } from '@/libs/hooks';
import { useRedirectHistory } from '@/libs/hooks/search/redirect/history/use-redirect-history';
import { returnedRedirectMock } from '@/pages/api/search/mocks';
import { ruleSetId } from '@/test/data/mock-use-rule-set-preview.data';
import { renderWithProviders } from '@/test/render-with-providers';

import type { GetServerSidePropsContext } from 'next';
import type { ParsedUrlQuery } from 'querystring';

import Page, { getServerSideProps } from './index.page';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('@/libs/hooks/search/redirect/use-redirect-detail', () => ({
  useRedirectDetail: jest.fn(),
}));
jest.mock('@/libs/hooks/search/redirect/use-redirect-update', () => ({
  useRedirectUpdate: jest.fn(),
}));
jest.mock('@/libs/hooks/search/redirect/history/use-redirect-history', () => ({
  useRedirectHistory: jest.fn(() => ({
    history: { changes: [], pagination: { totalItems: 0 } },
    isLoading: false,
    error: '',
  })),
}));

describe('Edit keyword redirect', () => {
  const mockUpdateRedirect = {
    updateRedirect: jest.fn(() =>
      Promise.resolve({ status: 'success' as const })
    ),
    isSaving: true,
    error: '',
  };

  const mockGetRedirect = {
    redirect: returnedRedirectMock,
    isLoading: false,
    error: '',
  };

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
    jest.mocked(useRedirectDetail).mockImplementation(() => mockGetRedirect);
    jest.mocked(useRedirectUpdate).mockImplementation(() => mockUpdateRedirect);
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('should save the redirect', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<Page id={ruleSetId} />);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(mockUpdateRedirect.updateRedirect).toHaveBeenCalled();
  });

  it('sends the v1 flag + version and shows the conflict modal on a 409', async () => {
    const updateRedirect = jest.fn(() =>
      Promise.resolve({
        status: 'conflict' as const,
        currentEntity: {
          ...returnedRedirectMock,
          ruleTitle: 'Updated by someone else',
          version: 4,
          lastChanged: { date: '2024-02-02T00:00:00Z', user: 'Other User' },
        },
      })
    );
    jest.mocked(useRedirectUpdate).mockImplementation(() => ({
      updateRedirect,
      isSaving: false,
      error: '',
    }));
    jest.mocked(useRedirectDetail).mockImplementation(() => ({
      redirect: { ...returnedRedirectMock, version: 2 },
      isLoading: false,
      error: '',
    }));

    const user = userEvent.setup({ delay: null });
    renderWithProviders(<Page id={ruleSetId} />);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(updateRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ version: 2 })
    );
    const dialog = await screen.findByRole('dialog', {
      name: 'This redirect was changed by someone else',
    });
    expect(dialog).toHaveTextContent(
      'title of redirect → Updated by someone else'
    );
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('surfaces an update error and does not navigate when the save fails', async () => {
    jest.mocked(useRedirectUpdate).mockImplementation(() => ({
      updateRedirect: jest.fn(() =>
        Promise.resolve({ status: 'error' as const })
      ),
      isSaving: false,
      error: 'Failed to update redirect',
    }));

    const user = userEvent.setup({ delay: null });
    renderWithProviders(<Page id={ruleSetId} />);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Failed to update redirect'
    );
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('should render the access denied page', async () => {
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

  it('should cancel changes to a redirect', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<Page id={ruleSetId} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockRouter.push).toHaveBeenCalledWith('/search/redirects');
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

  it('shows a loader when saving', async () => {
    const mockGetRedirect = {
      redirect: returnedRedirectMock,
      isLoading: true,
      error: '',
    };
    jest.mocked(useRedirectDetail).mockImplementation(() => mockGetRedirect);

    renderWithProviders(<Page id={ruleSetId} />);

    expect(screen.getByLabelText('loading content')).toBeInTheDocument();
  });

  it('should show errors', async () => {
    const mockGetRedirect = {
      redirect: returnedRedirectMock,
      isLoading: false,
      error: 'Error: Bad request',
    };
    jest.mocked(useRedirectDetail).mockImplementation(() => mockGetRedirect);

    renderWithProviders(<Page id={ruleSetId} />);

    expect(await screen.findByText('Error: Bad request')).toBeVisible();
  });

  describe('History view', () => {
    const mockHistoryChange = {
      id: 'history-change-id',
      entityId: 'entity-id',
      savedAt: '2024-01-01T00:00:00Z',
      savedBy: 'test-user',
      schemaVersion: '1',
      change: {
        ...returnedRedirectMock,
        id: 'historical-redirect-id',
      },
    };

    beforeEach(() => {
      jest.mocked(useRedirectHistory).mockReturnValue({
        history: { changes: [], pagination: { totalItems: 0 } },
        isLoading: false,
        error: '',
      });
    });

    it('should render redirect from history when history query param is true', async () => {
      (useRouter as jest.Mock).mockReturnValue({
        ...mockRouter,
        query: { history: 'true', historyId: 'history-change-id' },
      });

      jest.mocked(useRedirectHistory).mockReturnValue({
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

      jest.mocked(useRedirectHistory).mockReturnValue({
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

      jest.mocked(useRedirectHistory).mockReturnValue({
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

      jest.mocked(useRedirectHistory).mockReturnValue({
        history: { changes: [], pagination: { totalItems: 0 } },
        isLoading: false,
        error: 'Failed to load history',
      });

      renderWithProviders(<Page id={ruleSetId} />);

      expect(screen.getByText('Failed to load history')).toBeInTheDocument();
    });

    it('should not render redirect when historyId does not match any change', () => {
      (useRouter as jest.Mock).mockReturnValue({
        ...mockRouter,
        query: { history: 'true', historyId: 'non-existent-id' },
      });

      jest.mocked(useRedirectHistory).mockReturnValue({
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
