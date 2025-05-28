import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@/test/render-with-providers';

import { EditableLabel } from './editable-label';

jest.mock('@/libs/hooks', () => ({
  ...jest.requireActual('@/libs/hooks'),
  useCheckMergeNameUnique: jest.fn(),
}));

describe('editable-label', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('EditableLabel', () => {
    it('should render the EditableLabel component', () => {
      const onDisplayValueChange = jest.fn();
      renderWithProviders(
        <EditableLabel
          onDisplayValueChange={onDisplayValueChange}
          displayValue="color"
          setError={jest.fn()}
          showErrorState={false}
          handleUpdatedValue={jest.fn()}
        />
      );

      expect(screen.getByText('color')).toBeVisible();
    });

    it('should not call onDisplayValueChange when cancel button is clicked', async () => {
      const onDisplayValueChange = jest.fn();
      const mockCancel = jest.fn();
      renderWithProviders(
        <EditableLabel
          onDisplayValueChange={onDisplayValueChange}
          displayValue="color"
          canCancelEdit={true}
          onCancel={mockCancel}
          setError={jest.fn()}
          handleUpdatedValue={jest.fn()}
          showErrorState={false}
        />
      );

      const editButton = screen.getByLabelText('Edit display name for color');

      act(() => {
        editButton.click();
      });

      const cancelButton = screen.getByLabelText('Cancel color change');

      act(() => {
        cancelButton.click();
      });

      const label = await screen.findByTestId('Label for color');

      await waitFor(() => {
        expect(label).toBeVisible();
      });

      expect(label).toHaveTextContent('color');

      expect(onDisplayValueChange).not.toHaveBeenCalled();
      expect(mockCancel).toHaveBeenCalled();
    });

    it('should call onDisplayValueChange when save button is clicked', async () => {
      const onDisplayValueChange = jest.fn();
      const user = userEvent.setup({ delay: null });
      renderWithProviders(
        <EditableLabel
          onDisplayValueChange={onDisplayValueChange}
          displayValue="color"
          setError={jest.fn()}
          showErrorState={false}
          handleUpdatedValue={jest.fn()}
        />
      );

      const editButton = screen.getByLabelText('Edit display name for color');

      act(() => {
        editButton.click();
      });

      const editColorInput = await screen.findByLabelText(
        'Edit color input field'
      );

      await waitFor(async () => {
        expect(editColorInput).toBeVisible();
      });

      expect(editColorInput).toHaveValue('color');
      await user.clear(editColorInput);
      await user.type(editColorInput, 'colour');

      const saveButton = screen.getByLabelText('Save color change');

      act(() => {
        saveButton.click();
      });

      await waitFor(() => {
        const newEditButton = screen.getByRole('button', {
          name: 'Edit display name for color',
        });
        expect(newEditButton).toBeVisible();
      });

      expect(onDisplayValueChange).toHaveBeenCalledWith('colour');
    });

    it('should call onDisplayValueChange when enter key is pressed', async () => {
      const onDisplayValueChange = jest.fn();
      const user = userEvent.setup({ delay: null });
      renderWithProviders(
        <EditableLabel
          onDisplayValueChange={onDisplayValueChange}
          displayValue="color"
          setError={jest.fn()}
          showErrorState={false}
          handleUpdatedValue={jest.fn()}
        />
      );

      const editButton = screen.getByLabelText('Edit display name for color');

      act(() => {
        editButton.click();
      });

      const editColorInput = await screen.findByLabelText(
        'Edit color input field'
      );

      await waitFor(async () => {
        expect(editColorInput).toBeVisible();
      });

      expect(editColorInput).toHaveValue('color');
      await user.clear(editColorInput);
      await user.type(editColorInput, 'colour');
      await user.keyboard('{enter}');

      await waitFor(() => {
        const newEditButton = screen.getByRole('button', {
          name: 'Edit display name for color',
        });
        expect(newEditButton).toBeVisible();
      });

      expect(onDisplayValueChange).toHaveBeenCalledWith('colour');
    });

    it('should display error state and not allow save if error state is true', async () => {
      const onDisplayValueChange = jest.fn();
      const user = userEvent.setup({ delay: null });
      renderWithProviders(
        <EditableLabel
          onDisplayValueChange={onDisplayValueChange}
          displayValue="color"
          setError={jest.fn()}
          showErrorState={true}
          handleUpdatedValue={jest.fn()}
        />
      );

      await waitFor(async () => {
        await user.keyboard('{enter}');
      });

      const saveButton = screen.getByLabelText('Save color change');

      expect(saveButton).toBeDisabled();
      expect(onDisplayValueChange).not.toHaveBeenCalled();
    });

    it('should not call onDisplayValueChange when escape key is pressed', async () => {
      const onDisplayValueChange = jest.fn();
      const mockCancel = jest.fn();
      const user = userEvent.setup({ delay: null });
      renderWithProviders(
        <EditableLabel
          onDisplayValueChange={onDisplayValueChange}
          displayValue="color"
          canCancelEdit={true}
          onCancel={mockCancel}
          setError={jest.fn()}
          showErrorState={false}
          handleUpdatedValue={jest.fn()}
        />
      );

      const editButton = screen.getByLabelText('Edit display name for color');

      act(() => {
        editButton.click();
      });

      const editColorInput = await screen.findByLabelText(
        'Edit color input field'
      );

      await waitFor(async () => {
        expect(editColorInput).toBeVisible();
      });

      expect(editColorInput).toHaveValue('color');
      await user.clear(editColorInput);
      await user.type(editColorInput, 'colour');
      await user.keyboard('{Escape}');

      const label = await screen.findByTestId('Label for color');
      expect(label).toBeVisible();
      expect(label).toHaveTextContent('color');

      expect(onDisplayValueChange).not.toHaveBeenCalled();
      expect(mockCancel).toHaveBeenCalled();
    });
  });
});
