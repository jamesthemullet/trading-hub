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

    expect(screen.getByText('You have unsaved changes')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Stay on page' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Discard changes and continue' })
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/any changes made in the edit values screen/i)
    ).not.toBeInTheDocument();
  });

  it('should not show the extra values warning when isNewlyIncluded is false', () => {
    renderWithProviders(
      <ModalEditValuesUnsavedChanges
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
        isNewlyIncluded={false}
      />
    );

    expect(
      screen.queryByText(/any changes made in the edit values screen/i)
    ).not.toBeInTheDocument();
  });

  it('should show the extra values warning when isNewlyIncluded is true', () => {
    renderWithProviders(
      <ModalEditValuesUnsavedChanges
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
        isNewlyIncluded
      />
    );

    expect(
      screen.getByText(
        /any changes made in the edit values screen will also not be saved/i
      )
    ).toBeInTheDocument();
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

  it('should call onConfirm when Discard changes and continue is clicked', async () => {
    const mockConfirm = jest.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <ModalEditValuesUnsavedChanges
        onConfirm={mockConfirm}
        onCancel={jest.fn()}
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'Discard changes and continue' })
    );
    expect(mockConfirm).toHaveBeenCalled();
  });
});
