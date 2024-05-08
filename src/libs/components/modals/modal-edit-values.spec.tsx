import { screen } from '@testing-library/react';

import { renderWithProviders } from '../../../test/render-with-providers';
import { ModalEditValues } from './modal-edit-values';

describe('Add Facet Modal', () => {
  it('should render edit values modal', async () => {
    renderWithProviders(
      <ModalEditValues
        onClose={() => {}}
        facet={{
          displayValue: 'color',
          indexPropertyName: 'color',
          id: '1',
          lastChanged: { user: 'Bob', date: '2021-10-01' },
        }}
      />
    );

    expect(screen.getByText('Facet value settings of: color')).toBeVisible();
  });
});
