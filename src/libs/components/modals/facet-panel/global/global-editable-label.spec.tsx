import { screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/render-with-providers';

import { GlobalEditableLabel } from './global-editable-label';

describe('Global Editable label', () => {
  it('should render editable label', () => {
    renderWithProviders(
      <GlobalEditableLabel
        displayName="test attribute"
        errorStates={{}}
        editingValues={[]}
        facet={{} as any}
        countryCode="UK"
        merged={undefined}
        setError={jest.fn()}
        setMerged={jest.fn()}
        setEditingValues={jest.fn()}
      />
    );

    expect(screen.getByText('test attribute')).toBeVisible();
    expect(
      screen.getByRole('button', {
        name: 'Edit display name for test attribute',
      })
    ).toBeVisible();
  });
});
