import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@/test/render-with-providers';

import { ModalEditValuesUnsavedChanges } from './modal-edit-values-unsaved-changes';

describe('ModalEditValuesUnsavedChanges', () => {
  it('should render correctly', () => {
    renderWithProviders(
      <ModalEditValuesUnsavedChanges
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    expect(
      screen.getByRole('heading', { name: 'You have unsaved changes' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Stay on page' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Save changes and continue' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Discard changes and continue' })
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(
        'Navigating to edit facet values will save your unsaved changes. Do you want to continue?'
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Save required to continue' })
    ).not.toBeInTheDocument();
  });

  it('should show save-required title and description when isNewlyIncluded is true', () => {
    renderWithProviders(
      <ModalEditValuesUnsavedChanges
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
        isNewlyIncluded
      />
    );

    expect(
      screen.getByRole('heading', { name: 'Save required to continue' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Your changes will be saved before you continue to Edit facet values/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'You have unsaved changes' })
    ).not.toBeInTheDocument();
  });

  it('should call onCancel when Stay on page is clicked', async () => {
    const mockCancel = jest.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <ModalEditValuesUnsavedChanges
        onConfirm={jest.fn()}
        onCancel={mockCancel}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Stay on page' }));
    expect(mockCancel).toHaveBeenCalled();
  });

  it('should call onConfirm when Save changes and continue is clicked', async () => {
    const mockConfirm = jest.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <ModalEditValuesUnsavedChanges
        onConfirm={mockConfirm}
        onCancel={jest.fn()}
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'Save changes and continue' })
    );
    expect(mockConfirm).toHaveBeenCalled();
  });
});
