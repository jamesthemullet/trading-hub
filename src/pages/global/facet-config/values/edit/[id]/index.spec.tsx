import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import { useGlobalFacetsList } from '@/libs/hooks';
import { useFacetHistory } from '@/libs/hooks/global/facets/use-facet-history';
import { useGetFacetAttributeValues } from '@/libs/hooks/use-get-facet-attribute-values';
import { attributeValuesMock, facetsListMock } from '@/pages/api/search/mocks';
import { createMockNextRouter } from '@/test/create-mock-next-router';
import { renderWithProviders } from '@/test/render-with-providers';

import Page from './index.page';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/libs/hooks/global/facets/use-global-facets-list', () => ({
  useGlobalFacetsList: jest.fn(),
}));

jest.mock('@/libs/hooks/global/facets/use-facet-history', () => ({
  useFacetHistory: jest.fn(),
}));

jest.mock('@/libs/hooks/use-get-facet-attribute-values', () => ({
  useGetFacetAttributeValues: jest.fn(),
}));

describe('Index', () => {
  const facetId = 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84';

  beforeEach(() => {
    jest.mocked(useRouter).mockReturnValue(
      createMockNextRouter({
        query: {
          id: facetId,
          displayName: 'Color',
        },
      })
    );
    jest.mocked(useGlobalFacetsList).mockReturnValue({
      isLoading: false,
      facets: facetsListMock.facets,
      error: '',
      onRefreshFacetList: jest.fn(),
    });
    jest.mocked(useGetFacetAttributeValues).mockReturnValue({
      attributeValues: attributeValuesMock,
      error: '',
      isLoading: false,
    });
    jest.mocked(useFacetHistory).mockReturnValue({
      history: { changes: [], pagination: { totalItems: 0 } },
      error: '',
      isLoading: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the facet config values page', async () => {
    renderWithProviders(<Page />);

    await waitFor(() => {
      expect(screen.getByText('Facet values settings: Color')).toBeVisible();
    });
  });

  it('should render without write actions when readOnly is true', async () => {
    jest.mocked(useRouter).mockReturnValue(
      createMockNextRouter({
        query: {
          id: facetId,
          displayName: 'Color',
          readOnly: 'true',
        },
      })
    );

    renderWithProviders(<Page />);

    await waitFor(() => {
      expect(screen.getByText('Facet values settings: Color')).toBeVisible();
    });
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('should not show the read-only banner in explicit read-only mode', async () => {
    jest.mocked(useRouter).mockReturnValue(
      createMockNextRouter({
        query: {
          id: facetId,
          displayName: 'Color',
          readOnly: 'true',
        },
      })
    );

    renderWithProviders(<Page />, ['Glob.R'], {
      featureFlags: {
        hasAuthorization: true,
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Facet values settings: Color')).toBeVisible();
    });
    expect(
      screen.queryByText(/you're viewing this page in read-only mode/i, {
        exact: false,
      })
    ).not.toBeInTheDocument();
  });

  it('should render a historical facet snapshot when history is true', async () => {
    jest.mocked(useRouter).mockReturnValue(
      createMockNextRouter({
        query: {
          id: facetId,
          displayName: 'Color',
          history: 'true',
          historyId: 'change-2',
          currentPage: '2',
          currentPageSize: '10',
        },
      })
    );
    jest.mocked(useFacetHistory).mockReturnValue({
      history: {
        changes: [
          {
            id: 'change-2',
            change: {
              ...facetsListMock.facets[0],
              displayValue: 'Historical Color',
              boosted: ['Silk'],
              excludedValues: [],
              merged: [],
            },
          },
        ],
        pagination: { totalItems: 4 },
      },
      error: '',
      isLoading: false,
    });

    renderWithProviders(<Page />);

    expect(useGlobalFacetsList).toHaveBeenCalledWith({ enabled: false });
    expect(useFacetHistory).toHaveBeenCalledWith(facetId, 2, 10);
    expect(
      await screen.findByText('Facet values settings: Historical Color')
    ).toBeVisible();
    expect(
      screen.getByText('Value settings of: Historical Color')
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('should not show the read-only banner in history view', async () => {
    jest.mocked(useRouter).mockReturnValue(
      createMockNextRouter({
        query: {
          id: facetId,
          displayName: 'Color',
          history: 'true',
          historyId: 'change-2',
        },
      })
    );
    jest.mocked(useFacetHistory).mockReturnValue({
      history: {
        changes: [
          {
            id: 'change-2',
            change: {
              ...facetsListMock.facets[0],
              displayValue: 'Historical Color',
              boosted: ['Silk'],
              excludedValues: [],
              merged: [],
            },
          },
        ],
        pagination: { totalItems: 4 },
      },
      error: '',
      isLoading: false,
    });

    renderWithProviders(<Page />, ['Glob.R'], {
      featureFlags: {
        hasAuthorization: true,
      },
    });

    expect(
      await screen.findByText('Facet values settings: Historical Color')
    ).toBeVisible();
    expect(
      screen.queryByText(/you're viewing this page in read-only mode/i, {
        exact: false,
      })
    ).not.toBeInTheDocument();
  });

  it('should fall back to the query display name when the historical facet is missing', async () => {
    jest.mocked(useRouter).mockReturnValue(
      createMockNextRouter({
        query: {
          id: facetId,
          displayName: 'Color',
          history: 'true',
          historyId: 'missing-change',
        },
      })
    );

    renderWithProviders(<Page />);

    expect(
      await screen.findByText('Facet values settings: Color')
    ).toBeVisible();
    expect(
      screen.queryByText('Value settings of: Color')
    ).not.toBeInTheDocument();
  });

  it('should render a history error when history loading fails', async () => {
    jest.mocked(useRouter).mockReturnValue(
      createMockNextRouter({
        query: {
          id: facetId,
          displayName: 'Color',
          history: 'true',
          historyId: 'change-2',
        },
      })
    );
    jest.mocked(useFacetHistory).mockReturnValue({
      history: { changes: [], pagination: { totalItems: 0 } },
      error: 'Failed to load history',
      isLoading: false,
    });

    renderWithProviders(<Page />);

    expect(
      await screen.findByText(
        'Error whilst retrieving history: Failed to load history'
      )
    ).toBeVisible();
  });

  it('should not render current facet list errors in history view', async () => {
    jest.mocked(useRouter).mockReturnValue(
      createMockNextRouter({
        query: {
          id: facetId,
          displayName: 'Color',
          history: 'true',
          historyId: 'change-2',
        },
      })
    );
    jest.mocked(useGlobalFacetsList).mockReturnValue({
      isLoading: false,
      facets: [],
      error: 'Current facets failed',
      onRefreshFacetList: jest.fn(),
    });

    renderWithProviders(<Page />);

    await waitFor(() => {
      expect(
        screen.queryByText('Error whilst retrieving global facet list:', {
          exact: false,
        })
      ).not.toBeInTheDocument();
    });
  });

  it('should render attribute values error when base request fails', async () => {
    jest.mocked(useGetFacetAttributeValues).mockImplementation(({ query }) => ({
      attributeValues: [],
      error: query === '' ? 'Base attribute values failed' : '',
      isLoading: false,
    }));

    renderWithProviders(<Page />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Error retrieving values: Base attribute values failed'
      );
    });
  });

  it('should render searched attribute values error when search request fails', async () => {
    jest.useFakeTimers();
    jest.mocked(useGetFacetAttributeValues).mockImplementation(({ query }) => ({
      attributeValues: query === '' ? attributeValuesMock : [],
      error: query === '' ? '' : 'Search attribute values failed',
      isLoading: false,
    }));

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    renderWithProviders(<Page />);

    const searchInput = screen.getByPlaceholderText('Search');
    await user.type(searchInput, 'Duck');

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Error retrieving values: Search attribute values failed'
      );
    });

    jest.useRealTimers();
  });

  describe('searching', () => {
    it('should disable the searched values request when the query is empty', async () => {
      jest
        .mocked(useGetFacetAttributeValues)
        .mockImplementation(({ facetId: requestedFacetId }) => ({
          attributeValues:
            requestedFacetId === facetId ? attributeValuesMock : [],
          error: '',
          isLoading: false,
        }));

      renderWithProviders(<Page />);

      expect(useGetFacetAttributeValues).toHaveBeenCalledWith({
        facetId,
        query: '',
        countryCode: 'UK_IE',
      });
      expect(useGetFacetAttributeValues).toHaveBeenCalledWith({
        facetId: '',
        query: '',
        countryCode: 'UK_IE',
      });
      expect(await screen.findByText('12 results')).toBeVisible();
    });

    it('should request facet attribute values with the debounced search query', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      renderWithProviders(<Page />);

      const searchInput = screen.getByPlaceholderText('Search');
      await user.type(searchInput, 'Duck');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(useGetFacetAttributeValues).toHaveBeenCalledWith(
          expect.objectContaining({
            facetId,
            query: 'Duck',
          })
        );
      });

      jest.useRealTimers();
    });

    it('should disable the searched values request when a search is cleared', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      renderWithProviders(<Page />);

      const searchInput = screen.getByPlaceholderText('Search');
      await user.type(searchInput, 'Duck');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(useGetFacetAttributeValues).toHaveBeenCalledWith({
          facetId,
          query: 'Duck',
          countryCode: 'UK_IE',
        });
      });

      await user.clear(searchInput);

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(useGetFacetAttributeValues).toHaveBeenLastCalledWith({
          facetId: '',
          query: '',
          countryCode: 'UK_IE',
        });
      });

      jest.useRealTimers();
    });

    it('should display the correct amount of filtered items when the merge group name matches the filter', async () => {
      jest.useFakeTimers();
      const valuesByQuery: Record<string, typeof attributeValuesMock> = {
        '': attributeValuesMock,
        'test merged group': [{ displayValue: 'test merged group' }],
      };

      jest
        .mocked(useGetFacetAttributeValues)
        .mockImplementation(({ query }) => ({
          attributeValues: valuesByQuery[query] ?? [],
          error: '',
          isLoading: false,
        }));

      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithProviders(<Page />);

      await waitFor(() => {
        expect(screen.getByText('12 results')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search');

      await user.type(searchInput, 'test merged group');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText('1 result')).toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it('should display the correct amount of filtered items when the attribute values matches the filter', async () => {
      jest.useFakeTimers();
      const valuesByQuery: Record<string, typeof attributeValuesMock> = {
        '': attributeValuesMock,
        'Duck Down': [
          { displayValue: 'Duck Down' },
          { displayValue: 'Duck Down And Feather' },
        ],
      };

      jest
        .mocked(useGetFacetAttributeValues)
        .mockImplementation(({ query }) => ({
          attributeValues: valuesByQuery[query] ?? [],
          error: '',
          isLoading: false,
        }));

      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithProviders(<Page />);

      const searchInput = screen.getByPlaceholderText('Search');

      await user.type(searchInput, 'Duck Down');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText('2 results')).toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it('should display the correct amount of filtered items when the merged value group includes it', async () => {
      jest.useFakeTimers();
      const valuesByQuery: Record<string, typeof attributeValuesMock> = {
        '': attributeValuesMock,
        'merged 1': [
          { displayValue: 'Merged 1' },
          { displayValue: 'Other Merged 1' },
          { displayValue: 'merged 1' },
        ],
      };

      jest
        .mocked(useGetFacetAttributeValues)
        .mockImplementation(({ query }) => ({
          attributeValues: valuesByQuery[query] ?? [],
          error: '',
          isLoading: false,
        }));

      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithProviders(<Page />);

      const searchInput = screen.getByPlaceholderText('Search');

      await user.type(searchInput, 'merged 1');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText('3 results')).toBeInTheDocument();
      });

      jest.useRealTimers();
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

    it('should show read-only banner for read-only users', async () => {
      renderWithProviders(<Page />, ['Glob.R'], {
        featureFlags: {
          hasAuthorization: true,
        },
      });

      expect(
        await screen.findByText(/you're viewing this page in read-only mode/i, {
          exact: false,
        })
      ).toBeVisible();
    });

    it('should not show read-only banner for write-enabled users', async () => {
      renderWithProviders(<Page />, ['Glob.W'], {
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
  });
});
