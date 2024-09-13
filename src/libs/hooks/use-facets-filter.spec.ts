import { act } from 'react-dom/test-utils';
import { renderHook, waitFor } from '@testing-library/react';

import { useFacetsFilter } from './use-facets-filter';

const mockFacets = [
  {
    displayValue: 'color',
    indexPropertyName: 'color',
    id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
    lastChanged: {
      date: '2021-01-01T08:34:15Z',
      user: 'Test User',
    },
    merged: [],
  },
  {
    displayValue: 'size',
    indexPropertyName: 'size',
    id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a85',
    lastChanged: {
      date: '2021-01-02T08:34:15Z',
      user: 'Test User',
    },
    merged: [],
  },
  {
    displayValue: 'brand',
    indexPropertyName: 'brand',
    id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a86',
    lastChanged: {
      date: '2021-01-03T08:34:15Z',
      user: 'Test User',
    },
    merged: [],
  },
  {
    displayValue: 'category',
    indexPropertyName: 'category',
    id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a87',
    lastChanged: {
      date: '2021-01-04T08:34:15Z',
      user: 'Test User',
    },
    merged: [],
  },
  {
    displayValue: 'price',
    indexPropertyName: 'price',
    id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a88',
    lastChanged: {
      date: '2021-01-05T08:34:15Z',
      user: 'Test User',
    },
    merged: [],
  },
];

const mockEmptyDisplayValueFacets = [
  {
    displayValue: undefined as unknown as string,
    indexPropertyName: 'category',
    id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a87',
    lastChanged: {
      date: '2021-01-04T08:34:15Z',
      user: 'Test User',
    },
    merged: [],
  },
  {
    displayValue: 'price',
    indexPropertyName: 'price',
    id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a88',
    lastChanged: {
      date: '2021-01-05T08:34:15Z',
      user: 'Test User',
    },
    merged: [],
  },
];

describe('useFacetsFilter', () => {
  it('should render the hook', async () => {
    const { result } = renderHook(() => useFacetsFilter(mockFacets));

    await waitFor(() => {
      expect(result.current.search).toBe('');
    });
  });

  it('should filter the facets', async () => {
    const { result } = renderHook(() => useFacetsFilter(mockFacets));

    await waitFor(() => {
      expect(result.current.filteredFacets).toHaveLength(5);
    });

    act(() => {
      result.current.setSearch('color');
    });

    await waitFor(() => {
      expect(result.current.filteredFacets).toHaveLength(1);
    });
  });

  it('should filter the facets when displayValue is empty', async () => {
    const { result } = renderHook(() =>
      useFacetsFilter(mockEmptyDisplayValueFacets)
    );

    await waitFor(() => {
      expect(result.current.filteredFacets).toHaveLength(2);
    });

    act(() => {
      result.current.setSearch('price');
    });

    await waitFor(() => {
      expect(result.current.filteredFacets).toHaveLength(1);
    });
  });

  it('should not return anything if the search returns no results', async () => {
    const { result } = renderHook(() => useFacetsFilter(mockFacets));

    await waitFor(() => {
      expect(result.current.filteredFacets).toHaveLength(5);
    });

    act(() => {
      result.current.setSearch('shouldnotreturnanything');
    });

    await waitFor(() => {
      expect(result.current.filteredFacets).toHaveLength(0);
    });
  });

  it('should handle different cases the same', async () => {
    const { result } = renderHook(() => useFacetsFilter(mockFacets));

    await waitFor(() => {
      expect(result.current.filteredFacets).toHaveLength(5);
    });

    act(() => {
      result.current.setSearch('COLOR');
    });

    await waitFor(() => {
      expect(result.current.filteredFacets).toHaveLength(1);
    });

    act(() => {
      result.current.setSearch('cOLOR');
    });

    await waitFor(() => {
      expect(result.current.filteredFacets).toHaveLength(1);
    });

    act(() => {
      result.current.setSearch('color');
    });

    await waitFor(() => {
      expect(result.current.filteredFacets).toHaveLength(1);
    });
  });
});
