import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import { useFacetHistory } from '@/libs/hooks/global/facets/use-facet-history';
import { renderWithProviders } from '@/test/render-with-providers';

import type { GetServerSidePropsContext } from 'next';

import FacetConfigHistory, { getServerSideProps } from './index.page';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/libs/hooks/global/facets/use-facet-history', () => ({
  useFacetHistory: jest.fn(),
}));

jest.mock('@/libs/hooks/global/facets/use-global-facets-list', () => ({
  useGlobalFacetsList: jest.fn(() => ({ facets: [] })),
}));

const mockHistoryData = {
  changes: [
    {
      id: 'change1',
      change: {
        id: 'facet-1',
        indexPropertyName: 'colour',
        displayValue: 'Colour',
        merged: [{ displayValue: 'Blue', mergedValues: ['Navy', 'Cobalt'] }],
        excludedValues: ['Orange'],
        boosted: ['Red'],
        type: 'root' as const,
        lastChanged: { date: '2023-12-06T14:24:17Z', user: 'Mark Spencer' },
      },
    },
    {
      id: 'change0',
      change: {
        id: 'facet-1',
        indexPropertyName: 'colour',
        displayValue: 'Color',
        merged: [{ displayValue: 'Blue', mergedValues: ['Navy'] }],
        excludedValues: ['Pink'],
        boosted: [],
        type: 'root' as const,
        lastChanged: { date: '2023-12-05T09:00:00Z', user: 'Jane Smith' },
      },
    },
  ],
  pagination: { totalItems: 2 },
};

describe('FacetConfigHistory', () => {
  const defaultMockRouter = {
    query: { id: 'facet-1', displayName: 'Colour' },
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
    pathname: '/global/facet-config/history/[id]',
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(defaultMockRouter);
    jest.mocked(useFacetHistory).mockReturnValue({
      history: mockHistoryData,
      error: '',
      isLoading: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render facet config history', async () => {
    const user = userEvent.setup();

    renderWithProviders(<FacetConfigHistory id="facet-1" />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: 'Changes history' })
      ).toBeVisible();
    });

    expect(screen.getByText('Dec 6, 2023')).toBeVisible();
    expect(screen.getByText('14:24')).toBeVisible();
    expect(screen.getByText('Date')).toBeVisible();
    expect(screen.getByText('Time')).toBeVisible();
    expect(screen.getByText('Changes Made')).toBeVisible();
    expect(screen.getByText('User')).toBeVisible();
    expect(
      screen.getByText('Display name changed: Color → Colour')
    ).toBeVisible();
    expect(
      screen.getByText('Merge group changed: Blue (Navy → Navy, Cobalt)')
    ).toBeVisible();
    expect(screen.getByText('Value included: Red')).toBeVisible();
    expect(screen.getByText('Value excluded: Orange')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Show More' }));
    expect(screen.getByText('Value exclusion removed: Pink')).toBeVisible();
    expect(screen.queryByText('Facet config created')).not.toBeInTheDocument();
    expect(screen.getByText('Mark Spencer')).toBeVisible();
    expect(screen.getByRole('link', { name: 'View current' })).toHaveAttribute(
      'href',
      '/global/facet-config/values/edit/facet-1?displayName=Colour'
    );
    expect(screen.getByRole('link', { name: 'View' })).toHaveAttribute(
      'href',
      '/global/facet-config/values/edit/facet-1?displayName=Colour&history=true&historyId=change0&currentPage=1&currentPageSize=20'
    );
  });

  it('should describe added, removed, and unnamed merge groups', async () => {
    const user = userEvent.setup();

    jest.mocked(useFacetHistory).mockReturnValue({
      history: {
        changes: [
          {
            id: 'change1',
            change: {
              ...mockHistoryData.changes[0].change,
              merged: [
                { displayValue: 'Added', mergedValues: ['New'] },
                { mergedValues: ['Unnamed'] },
                { displayValue: 'Changed' },
              ],
              boosted: [],
            },
          },
          {
            id: 'change0',
            change: {
              ...mockHistoryData.changes[1].change,
              merged: [
                { displayValue: 'Removed', mergedValues: ['Old'] },
                { displayValue: 'Changed', mergedValues: ['Before'] },
              ],
              boosted: ['Red'],
            },
          },
        ],
        pagination: { totalItems: 2 },
      },
      error: '',
      isLoading: false,
    });

    renderWithProviders(<FacetConfigHistory id="facet-1" />);

    expect(screen.getByText('Merge group added: Added')).toBeVisible();
    expect(
      screen.getByText('Merge group added: Unnamed merge group')
    ).toBeVisible();
    expect(screen.getByText('Merge group removed: Removed')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Show More' }));
    expect(
      screen.getByText('Merge group changed: Changed (Before → )')
    ).toBeVisible();
    expect(screen.getByText('Value include removed: Red')).toBeVisible();
  });

  it('should diff multiple unnamed and duplicate merge groups independently', () => {
    jest.mocked(useFacetHistory).mockReturnValue({
      history: {
        changes: [
          {
            id: 'change1',
            change: {
              ...mockHistoryData.changes[0].change,
              displayValue: 'Colour',
              merged: [
                { mergedValues: ['First after'] },
                { mergedValues: ['Second'] },
                { displayValue: 'Duplicate', mergedValues: ['One after'] },
                { displayValue: 'Duplicate', mergedValues: ['Two'] },
              ],
              boosted: [],
              excludedValues: [],
            },
          },
          {
            id: 'change0',
            change: {
              ...mockHistoryData.changes[1].change,
              displayValue: 'Colour',
              merged: [
                { mergedValues: ['First before'] },
                { mergedValues: ['Second'] },
                { displayValue: 'Duplicate', mergedValues: ['One before'] },
                { displayValue: 'Duplicate', mergedValues: ['Two'] },
              ],
              boosted: [],
              excludedValues: [],
            },
          },
        ],
        pagination: { totalItems: 2 },
      },
      error: '',
      isLoading: false,
    });

    renderWithProviders(<FacetConfigHistory id="facet-1" />);

    expect(
      screen.getByText(
        'Merge group changed: Unnamed merge group (First before → First after)'
      )
    ).toBeVisible();
    expect(
      screen.getByText(
        'Merge group changed: Duplicate (One before → One after)'
      )
    ).toBeVisible();
  });

  it('should show no changes and derive the total when pagination omits it', () => {
    const unchangedFacet = {
      ...mockHistoryData.changes[0].change,
      merged: undefined,
      boosted: undefined,
      excludedValues: undefined,
    };
    jest.mocked(useFacetHistory).mockReturnValue({
      history: {
        changes: [
          { id: 'change1', change: unchangedFacet },
          { id: 'change0', change: unchangedFacet },
        ],
        pagination: {},
      },
      error: '',
      isLoading: false,
    });

    renderWithProviders(<FacetConfigHistory id="facet-1" />);

    expect(screen.getAllByText('—')).toHaveLength(2);
    expect(screen.getByTestId('results count')).toHaveTextContent(
      '1 - 2 out of 2'
    );
  });

  it('should use query pagination and handle navigation', async () => {
    const user = userEvent.setup();
    const router = {
      ...defaultMockRouter,
      query: {
        id: 'facet-1',
        currentPage: '2',
        currentPageSize: '10',
      },
    };
    (useRouter as jest.Mock).mockReturnValue(router);
    jest.mocked(useFacetHistory).mockReturnValue({
      history: {
        changes: [mockHistoryData.changes[0]],
        pagination: { totalItems: 30 },
      },
      error: '',
      isLoading: false,
    });

    renderWithProviders(<FacetConfigHistory id="facet-1" />);

    expect(useFacetHistory).toHaveBeenCalledWith('facet-1', 2, 10);
    expect(screen.queryByText('Colour')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/global/facet-config/history/[id]',
      query: { id: 'facet-1', currentPage: 3, currentPageSize: 10 },
    });

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(router.back).toHaveBeenCalled();
  });

  it('should suppress creation text for the final row on a non-final page', () => {
    (useRouter as jest.Mock).mockReturnValue({
      ...defaultMockRouter,
      query: {
        id: 'facet-1',
        currentPage: '2',
        currentPageSize: '2',
      },
    });
    jest.mocked(useFacetHistory).mockReturnValue({
      history: {
        changes: [mockHistoryData.changes[0]],
        pagination: { totalItems: 5 },
      },
      error: '',
      isLoading: false,
    });

    renderWithProviders(<FacetConfigHistory id="facet-1" />);

    expect(screen.queryByText('Facet config created')).not.toBeInTheDocument();
    expect(screen.getByText('—')).toBeVisible();
  });

  it('should render error message when there is an error', async () => {
    jest.mocked(useFacetHistory).mockReturnValue({
      history: { changes: [], pagination: { totalItems: 0 } },
      error: 'Failed to fetch history',
      isLoading: false,
    });

    renderWithProviders(<FacetConfigHistory id="facet-1" />);

    await waitFor(() => {
      expect(
        screen.getByText(
          'Error whilst retrieving history: Failed to fetch history'
        )
      ).toBeVisible();
    });
  });

  it('should render a loader while loading', () => {
    jest.mocked(useFacetHistory).mockReturnValue({
      history: { changes: [], pagination: { totalItems: 0 } },
      error: '',
      isLoading: true,
    });

    renderWithProviders(<FacetConfigHistory id="facet-1" />);

    expect(screen.queryByText('Date')).not.toBeInTheDocument();
  });

  it('should render the access denied page when user lacks read access', async () => {
    renderWithProviders(<FacetConfigHistory id="facet-1" />, []);

    await waitFor(() => {
      expect(
        screen.getByText('please contact admin on our teams channel', {
          exact: false,
        })
      ).toBeVisible();
    });
  });
});

describe('getServerSideProps', () => {
  it('should return the id from the query', async () => {
    const mockContext = {
      query: { id: 'facet-1' },
    } as unknown as GetServerSidePropsContext;

    const result = await getServerSideProps(mockContext);

    expect(result).toEqual({
      props: { id: 'facet-1' },
    });
  });

  it('should return an empty id when it is missing from the query', async () => {
    const mockContext = {
      query: {},
    } as GetServerSidePropsContext;

    const result = await getServerSideProps(mockContext);

    expect(result).toEqual({ props: { id: '' } });
  });
});
