import { screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/render-with-providers';

import { TablePaginationSkeleton } from './table-pagination-skeleton';

describe('TablePaginationSkeleton', () => {
  it('should render correctly', () => {
    renderWithProviders(<TablePaginationSkeleton />);

    expect(screen.getByLabelText('table-pagination-skeleton')).toBeVisible();
  });
});
