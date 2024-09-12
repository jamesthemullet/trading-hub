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
        />
      );

      expect(screen.getByText('color')).toBeVisible();
    });

    it('should not call onDisplayValueChange when cancel button is clicked', async () => {
      const onDisplayValueChange = jest.fn();
      renderWithProviders(
        <EditableLabel
          onDisplayValueChange={onDisplayValueChange}
          displayValue="color"
          canCancelEdit={true}
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

      await waitFor(() => {
        const label = screen.getByLabelText('Label for color');

        expect(label).toBeVisible();
        expect(label).toHaveTextContent('color');
      });

      expect(onDisplayValueChange).not.toHaveBeenCalled();
    });

    it('should call onDisplayValueChange when save button is clicked', async () => {
      const onDisplayValueChange = jest.fn();
      renderWithProviders(
        <EditableLabel
          onDisplayValueChange={onDisplayValueChange}
          displayValue="color"
        />
      );

      const editButton = screen.getByLabelText('Edit display name for color');

      act(() => {
        editButton.click();
      });

      await waitFor(async () => {
        const editColorInput = screen.getByLabelText('Edit color input field');
        expect(editColorInput).toBeVisible();
        expect(editColorInput).toHaveValue('color');
        userEvent.clear(editColorInput);
        await userEvent.type(editColorInput, 'colour');
      });

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
      renderWithProviders(
        <EditableLabel
          onDisplayValueChange={onDisplayValueChange}
          displayValue="color"
        />
      );

      const editButton = screen.getByLabelText('Edit display name for color');

      act(() => {
        editButton.click();
      });

      await waitFor(async () => {
        const editColorInput = screen.getByLabelText('Edit color input field');
        expect(editColorInput).toBeVisible();
        expect(editColorInput).toHaveValue('color');
        userEvent.clear(editColorInput);
        await userEvent.type(editColorInput, 'colour');
        userEvent.keyboard('{enter}');
      });

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
      renderWithProviders(
        <EditableLabel
          onDisplayValueChange={onDisplayValueChange}
          displayValue="color"
          shouldOpenFromParent={true}
          error="Invalid input"
        />
      );

      await waitFor(async () => {
        userEvent.keyboard('{enter}');
      });

      const saveButton = screen.getByLabelText('Save color change');

      expect(saveButton).toBeDisabled();
      expect(onDisplayValueChange).not.toHaveBeenCalled();
    });

    it('should not call onDisplayValueChange when escape key is pressed', async () => {
      const onDisplayValueChange = jest.fn();
      renderWithProviders(
        <EditableLabel
          onDisplayValueChange={onDisplayValueChange}
          displayValue="color"
          canCancelEdit={true}
        />
      );

      const editButton = screen.getByLabelText('Edit display name for color');

      act(() => {
        editButton.click();
      });

      await waitFor(async () => {
        const editColorInput = screen.getByLabelText('Edit color input field');
        expect(editColorInput).toBeVisible();
        expect(editColorInput).toHaveValue('color');
        await userEvent.clear(editColorInput);
        await userEvent.type(editColorInput, 'colour');
        await userEvent.keyboard('{Escape}');
      });

      const label = screen.getByLabelText('Label for color');
      expect(label).toBeVisible();
      expect(label).toHaveTextContent('color');

      expect(onDisplayValueChange).not.toHaveBeenCalled();
    });
  });
});
