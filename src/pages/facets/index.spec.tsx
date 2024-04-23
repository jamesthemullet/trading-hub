import { render, screen } from '@testing-library/react';

import { useFacetsList } from '@/libs/hooks';

import { default as FacetManagementPage } from './index.page';
import { globalFacetsListMock } from '@/pages/api/merchandising/mocks';

jest.mock('@/libs/hooks', () => ({
  ...jest.requireActual('@/libs/hooks'),
  useFacetsList: jest.fn(),
}));

describe('Category facet management', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('displays the list of rules', () => {
    jest
      .mocked(useFacetsList)
      .mockReturnValue({ facets: globalFacetsListMock.facets, error: '' });
    render(<FacetManagementPage />);

    expect(screen.getByText('Category Facet Management')).toBeVisible();
    expect(screen.getByText('Add facet')).toBeVisible();
    expect(
      screen.getByText(globalFacetsListMock.facets[0].displayValue)
    ).toBeVisible();
  });
});
