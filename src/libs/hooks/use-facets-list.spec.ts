import { renderHook, waitFor } from '@testing-library/react';

import { useFacetsList } from './use-facets-list';

describe('useFacetsList', () => {
  it('should render the hook', async () => {
    const { result } = renderHook(() => useFacetsList());

    await waitFor(() => {
      expect(result.current.facets.length).toEqual(5);
    });
  });
});
