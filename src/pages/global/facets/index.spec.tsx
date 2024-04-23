import { act, render, screen } from '@testing-library/react';

import { useFacetsList } from '@/libs/hooks';

import { default as FacetManagementPage } from './index.page';
import userEvent from '@testing-library/user-event';
import { globalFacetsListMock } from '@/pages/api/merchandising/mocks';

jest.mock('@/libs/hooks', () => ({
  ...jest.requireActual('@/libs/hooks'),
  useFacetsList: jest.fn(),
}));

describe('Global Facet Management', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('displays the list of facets', () => {
    jest
      .mocked(useFacetsList)
      .mockReturnValue({ facets: globalFacetsListMock.facets, error: '' });
    render(<FacetManagementPage />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Global Facet Management' })
    ).toBeVisible();
    expect(screen.getByText('Add rule')).toBeVisible();
    expect(
      screen.getByText(globalFacetsListMock.facets[0].displayValue)
    ).toBeVisible();
  });

  it('searches on the facets list', async () => {
    jest
      .mocked(useFacetsList)
      .mockReturnValue({ facets: globalFacetsListMock.facets, error: '' });
    render(<FacetManagementPage />);

    const search = screen.queryByPlaceholderText(/Search\.\.\./i);

    if (!search) {
      throw new Error('Search not found');
    }

    await act(() => userEvent.type(search, 'col'));

    expect(
      screen.getByText(globalFacetsListMock.facets[0].displayValue)
    ).toBeVisible();
    expect(
      screen.queryAllByText(globalFacetsListMock.facets[1].displayValue).length
    ).toBe(0);
  });
});
