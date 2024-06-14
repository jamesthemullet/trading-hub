import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ReturnedFacet } from '@/libs/api';
import { useFacetsFilter } from '@/libs/hooks';
import { renderWithProviders } from '@/test/render-with-providers';

import { default as FacetManagementPage } from './index.page';

jest.mock('@/libs/hooks', () => ({
  ...jest.requireActual('@/libs/hooks'),
  useFacetsFilter: jest.fn(),
}));

const globalFacet: ReturnedFacet[] = [
  {
    lastChanged: {
      date: '2023-11-15T13:00:00.000Z',
      user: 'testuser',
    },
    displayValue: '*',
    id: '1',
    indexPropertyName: '*',
  },
];

describe('Global Facet Management', () => {
  it('displays the list of facets', () => {
    const setSearchSpy = jest.fn();
    jest.mocked(useFacetsFilter).mockReturnValue({
      search: '',
      setSearch: setSearchSpy,
      filteredFacets: globalFacet,
    });

    renderWithProviders(<FacetManagementPage />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Global Facet Management' })
    ).toBeVisible();
    expect(screen.getByText('Add rule')).toBeVisible();
    expect(screen.getByText('testuser')).toBeVisible();
  });

  it('searches on the facets list', async () => {
    const setSearchSpy = jest.fn();
    jest.mocked(useFacetsFilter).mockReturnValue({
      search: '',
      setSearch: setSearchSpy,
      filteredFacets: globalFacet,
    });

    const user = userEvent.setup();
    renderWithProviders(<FacetManagementPage />);

    const search = screen.queryByPlaceholderText(/Search\.\.\./i);

    if (!search) {
      throw new Error('Search not found');
    }

    await user.type(search, '*');

    await waitFor(() => expect(setSearchSpy).toHaveBeenCalledWith('*'));
  });
});
