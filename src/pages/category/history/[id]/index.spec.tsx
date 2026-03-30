import { screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';

import { useCategoryHistory } from '@/libs/hooks/category/history/use-category-history';
import { renderWithProviders } from '@/test/render-with-providers';

import type { GetServerSidePropsContext } from 'next';

import CategoryHistory, { getServerSideProps } from './index.page';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/libs/hooks/category/history/use-category-history', () => ({
  useCategoryHistory: jest.fn(),
}));

const mockHistoryData = {
  changes: [
    {
      id: 'change1',
      entityId: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
      savedAt: '2023-12-06T14:24:17Z',
      savedBy: 'Mark Spencer',
      schemaVersion: '1.0',
      change: {
        rules: {
          pinnedProducts: [],
          blockedProducts: [],
          boosts: { numeric: [], alphanumeric: [], product: [] },
          buries: { numeric: [], alphanumeric: [], product: [] },
          includes: { alphanumeric: [] },
          excludes: { alphanumeric: [] },
        },
        categoriesInfo: [{ id: 'cat1' }],
        isEnabled: true,
        id: 'df70401f-f89d-45ad-92e7-6e152930ff86',
        lastChanged: { date: '2023-12-06T14:24:17Z', user: 'Mark Spencer' },
      },
    },
  ],
  pagination: { totalItems: 1 },
};

describe('Category History', () => {
  const defaultMockRouter = {
    query: {
      id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
      identifier: 'Test Category',
    },
    push: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(defaultMockRouter);
    jest.mocked(useCategoryHistory).mockReturnValue({
      history: mockHistoryData,
      error: '',
      isLoading: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render category history', async () => {
    renderWithProviders(<CategoryHistory id="some-id" />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: 'Subcategory History' })
      ).toBeVisible();
    });

    expect(screen.getByText('Dec 6, 2023 (current)')).toBeVisible();
    expect(screen.getByText('14:24')).toBeVisible();
    expect(screen.getByText('Mark Spencer')).toBeVisible();
  });

  it('should render error message when there is an error', async () => {
    jest.mocked(useCategoryHistory).mockReturnValue({
      history: {
        changes: [],
        pagination: { totalItems: 0 },
      },
      error: 'Failed to fetch history',
      isLoading: false,
    });

    renderWithProviders(<CategoryHistory id="some-id" />);

    await waitFor(() => {
      expect(
        screen.getByText(
          'Error whilst retrieving history: Failed to fetch history'
        )
      ).toBeVisible();
    });
  });

  it('should render the access denied page', async () => {
    renderWithProviders(<CategoryHistory id="some-id" />, [], {
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
});

describe('getServerSideProps', () => {
  it('should return the id from the query', async () => {
    const mockContext = {
      query: { id: 'test-ruleset-id' },
    } as unknown as GetServerSidePropsContext;

    const result = await getServerSideProps(mockContext);

    expect(result).toEqual({
      props: { id: 'test-ruleset-id' },
    });
  });
});
