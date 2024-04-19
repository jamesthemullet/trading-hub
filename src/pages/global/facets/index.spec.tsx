import { render, screen } from '@testing-library/react';

import { useFacetsListMockData } from '@/libs/hooks/data/mock-use-facets-list';
import { useFacetsList } from '@/libs/hooks';

import { default as FacetManagementPage } from './index.page';
import userEvent from '@testing-library/user-event';

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

    expect(
      screen.getByRole('heading', { level: 2, name: 'Global Facet Management' })
    ).toBeVisible();
    expect(screen.getByText('Add rule')).toBeVisible();
    expect(
      screen.getByText(useFacetsListMockData.facets[0].displayValue)
    ).toBeVisible();
  });

  it('searches on the facets list', async () => {
    jest.mocked(useFacetsList).mockReturnValue(useFacetsListMockData);
    render(<FacetManagementPage />);

    const search = screen.queryByPlaceholderText(/Search\.\.\./i);

    if (!search) {
      throw new Error('Search not found');
    }

    await userEvent.type(search, '1');
    expect(
      screen.getByText(useFacetsListMockData.facets[0].displayValue)
    ).toBeVisible();
    expect(
      screen.queryAllByText(useFacetsListMockData.facets[1].displayValue).length
    ).toBe(0);
  });
});
