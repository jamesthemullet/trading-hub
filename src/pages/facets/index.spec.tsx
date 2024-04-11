// import { act } from 'react-dom/test-utils';
import { render, screen } from '@testing-library/react';

import { useFacetsListMockData } from '@/libs/hooks/data/mock-use-facets-list';
import { useFacetsList } from '@/libs/hooks';

import { default as FacetManagementPage } from './index.page';

jest.mock('../../libs/hooks/use-facets-list', () => ({
  useFacetsList: jest.fn(),
}));

process.env.DEBUG_PRINT_LIMIT = '1000000';

describe('Category facet management', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('displays the list of rules', () => {
    jest.mocked(useFacetsList).mockReturnValue(useFacetsListMockData);
    render(<FacetManagementPage />);

    expect(screen.getByText('Category facet management')).toBeVisible();
    expect(screen.getByText('Add facet')).toBeVisible();
    expect(
      screen.getByText(useFacetsListMockData.facets[0].displayValue)
    ).toBeVisible();
  });
});
