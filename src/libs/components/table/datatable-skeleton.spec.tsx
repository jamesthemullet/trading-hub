import { screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/render-with-providers';

import { DataTableSkeleton } from './datatable-skeleton';

const headings = ['Identifier', 'Enable', 'Last Changed', 'User', 'Actions'];

describe('TablePaginationSkeleton', () => {
  it('should render correctly', () => {
    renderWithProviders(
      <DataTableSkeleton headings={headings} rowsCount={5} />
    );

    expect(screen.getByLabelText('datatable-skeleton')).toBeVisible();
    expect(screen.getByText('Identifier')).toBeVisible();
  });
});
