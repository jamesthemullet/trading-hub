import { act, render, screen } from '@testing-library/react';

import { default as FacetManagementPage } from './index.page';
import userEvent from '@testing-library/user-event';

jest.mock('@/libs/hooks', () => ({
  ...jest.requireActual('@/libs/hooks'),
  useFacetsList: jest.fn(),
}));

describe('Global Facet Management', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('displays the list of facets', () => {
    render(<FacetManagementPage />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Global Facet Management' })
    ).toBeVisible();
    expect(screen.getByText('Add rule')).toBeVisible();
    expect(screen.getByText('testuser')).toBeVisible();
  });

  it('searches on the facets list', async () => {
    render(<FacetManagementPage />);

    const search = screen.queryByPlaceholderText(/Search\.\.\./i);

    if (!search) {
      throw new Error('Search not found');
    }

    await act(() => userEvent.type(search, '*'));

    expect(screen.getByText('*')).toBeVisible();
  });
});
