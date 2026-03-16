import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import { useGlobalFacetsList } from '@/libs/hooks';
import { useGetFacetAttributeValues } from '@/libs/hooks/use-get-facet-attribute-values';
import { attributeValuesMock, facetsListMock } from '@/pages/api/search/mocks';
import { ruleSetId } from '@/test/data/mock-use-rule-set-preview.data';
import { renderWithProviders } from '@/test/render-with-providers';

import Page from './index.page';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/libs/hooks/global/facets/use-global-facets-list', () => ({
  useGlobalFacetsList: jest.fn(),
}));

jest.mock('@/libs/hooks/use-get-facet-attribute-values', () => ({
  useGetFacetAttributeValues: jest.fn(),
}));

describe('Index', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      query: {
        id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
        searchTerms: 'dress',
        ruleSetId,
        displayName: 'Color',
      },
    });
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render new facet values page', async () => {
    renderWithProviders(<Page />);

    await waitFor(() => {
      expect(screen.getByText('Facet values settings: Color')).toBeVisible();
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
            query: 'Duck',
          })
        );
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
  });
});
