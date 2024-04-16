import { render, screen } from '@testing-library/react';

import { useFacetsListMockData } from '@/libs/hooks/data/mock-use-facets-list';
import { useFacetsList } from '@/libs/hooks';

import { default as FacetManagementPage } from './index.page';

jest.mock('../../../libs/hooks/use-facets-list', () => ({
  useFacetsList: jest.fn(),
}));

describe('Global Facet Management', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('displays the list of facets', () => {
    jest.mocked(useFacetsList).mockReturnValue(useFacetsListMockData);
    render(<FacetManagementPage />);

    // getting second one by text here as we have same text in navigation
    expect(screen.getAllByText('Global Facet Management')[1]).toBeVisible();
    expect(screen.getByText('Add facet')).toBeVisible();
    expect(
      screen.getByText(useFacetsListMockData.facets[0].displayValue)
    ).toBeVisible();
  });
});
