import type { ActionDispatch } from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type {
  GlobalAttributesPageReducer,
  GlobalAttributesPageState,
} from '@/libs/stores/global-attributes-page/global-attributes-page-reducer';
import { renderWithProviders } from '@/test/render-with-providers';

import { GlobalFacetAttributesEditModal } from './global-facet-attributes-edit-modal';

describe('GlobalFacetAttributesEditModal', () => {
  const mockDispatch: ActionDispatch<[action: GlobalAttributesPageReducer]> =
    jest.fn();
  const mockHandleError = jest.fn();
  const mockOnSave = jest.fn();

  const baseState: GlobalAttributesPageState = {
    boostedRows: [],
    nonBoostedExcludedRows: [],
    excludedRows: [],
    merged: [
      {
        displayValue: 'Group A',
        mergedValues: ['a', 'b', 'c'],
      },
    ],
    errorStates: {},
    currentMerge: {
      isOpen: true,
      displayValue: 'Group A',
      mergedValues: ['a', 'b', 'c'],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders merged values and input with display name', () => {
    renderWithProviders(
      <GlobalFacetAttributesEditModal
        globalAttributesLocalState={baseState}
        dispatch={mockDispatch}
        error=""
        handleError={mockHandleError}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Edit merge')).toBeVisible();

    expect(screen.getByText('a')).toBeVisible();
    expect(screen.getByText('b')).toBeVisible();
    expect(screen.getByText('c')).toBeVisible();

    const input = screen.getByRole('textbox', {
      name: `Edit ${baseState.currentMerge.displayValue} input field`,
    });

    expect(input).toBeInTheDocument();
    expect(input).toHaveValue(baseState.currentMerge.displayValue);

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible();
  });

  it('calls dispatch CLOSE_MERGE_GROUP_MODAL when cancel clicked', async () => {
    renderWithProviders(
      <GlobalFacetAttributesEditModal
        globalAttributesLocalState={baseState}
        dispatch={mockDispatch}
        error=""
        handleError={mockHandleError}
        onSave={mockOnSave}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'CLOSE_MERGE_GROUP_MODAL',
      });
    });
  });

  it('calls onSave with new value and does not close modal when save clicked', async () => {
    renderWithProviders(
      <GlobalFacetAttributesEditModal
        globalAttributesLocalState={baseState}
        dispatch={mockDispatch}
        error=""
        handleError={mockHandleError}
        onSave={mockOnSave}
      />
    );

    const input = screen.getByRole('textbox', {
      name: `Edit ${baseState.currentMerge.displayValue} input field`,
    });

    await userEvent.clear(input);
    await userEvent.type(input, 'New Group Name');

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith('New Group Name');
      expect(mockDispatch).not.toHaveBeenCalledWith({
        type: 'CLOSE_MERGE_GROUP_MODAL',
      });
    });
  });

  it('shows error icon when error prop passed', async () => {
    renderWithProviders(
      <GlobalFacetAttributesEditModal
        globalAttributesLocalState={baseState}
        dispatch={mockDispatch}
        error="some error"
        handleError={mockHandleError}
        onSave={mockOnSave}
      />
    );

    await waitFor(() => {
      const images = screen.getAllByAltText('edit-facet-attributes-error-icon');
      expect(images.length).toBeGreaterThan(0);
    });
  });

  it('shows Show More / Show Fewer when merged values exceed maxVisible and toggles', async () => {
    const longState: GlobalAttributesPageState = {
      ...baseState,
      merged: [
        {
          displayValue: 'Big Group',
          mergedValues: ['a', 'b', 'c', 'd', 'e'],
        },
      ],
      currentMerge: {
        isOpen: true,
        displayValue: 'Big Group',
        mergedValues: ['a', 'b', 'c', 'd', 'e'],
      },
    };

    renderWithProviders(
      <GlobalFacetAttributesEditModal
        globalAttributesLocalState={longState}
        dispatch={mockDispatch}
        error=""
        handleError={mockHandleError}
        onSave={mockOnSave}
      />
    );

    const toggle = screen.getByRole('button', {
      name: /Show More|Show Fewer/i,
    });
    expect(toggle).toBeVisible();

    await userEvent.click(toggle);
    expect(
      screen.getByRole('button', {
        name: 'Show Fewer',
      })
    ).toBeVisible();

    await userEvent.click(screen.getByText('Show Fewer'));
    expect(
      screen.getByRole('button', {
        name: 'Show More',
      })
    ).toBeVisible();
  });

  it('calls handleError when input cleared', async () => {
    renderWithProviders(
      <GlobalFacetAttributesEditModal
        globalAttributesLocalState={baseState}
        dispatch={mockDispatch}
        error=""
        handleError={mockHandleError}
        onSave={mockOnSave}
      />
    );

    const input = screen.getByRole('textbox', {
      name: `Edit ${baseState.currentMerge.displayValue} input field`,
    });

    await userEvent.clear(input);
    expect(mockHandleError).toHaveBeenCalledWith('You must supply a value');
  });

  it('clears error when typing if error prop is set', async () => {
    renderWithProviders(
      <GlobalFacetAttributesEditModal
        globalAttributesLocalState={baseState}
        dispatch={mockDispatch}
        error="some error"
        handleError={mockHandleError}
        onSave={mockOnSave}
      />
    );

    const input = screen.getByRole('textbox', {
      name: `Edit ${baseState.currentMerge.displayValue} input field`,
    });

    await userEvent.clear(input);
    await userEvent.type(input, 'X');
    expect(mockHandleError).toHaveBeenCalledWith('');
  });

  it('invokes requestAnimationFrame when remove merged facet clicked', async () => {
    renderWithProviders(
      <GlobalFacetAttributesEditModal
        globalAttributesLocalState={baseState}
        dispatch={mockDispatch}
        error=""
        handleError={mockHandleError}
        onSave={mockOnSave}
      />
    );

    const rafSpy = jest.spyOn(window, 'requestAnimationFrame');

    const removeButtons = screen.getAllByLabelText(/Remove merged facet for/i);
    expect(removeButtons.length).toBeGreaterThan(0);

    await userEvent.click(removeButtons[0]);

    expect(rafSpy).toHaveBeenCalled();

    rafSpy.mockRestore();
  });

  it('dispatches REMOVE_FROM_CURRENT_MERGE with correct payload when remove merged facet clicked', async () => {
    const raf = jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb: any) => cb(0));

    renderWithProviders(
      <GlobalFacetAttributesEditModal
        globalAttributesLocalState={baseState}
        dispatch={mockDispatch}
        error=""
        handleError={mockHandleError}
        onSave={mockOnSave}
      />
    );

    const removeButtons = screen.getAllByLabelText(/Remove merged facet for/i);
    expect(removeButtons.length).toBeGreaterThan(0);

    await userEvent.click(removeButtons[1]);

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'REMOVE_FROM_CURRENT_MERGE',
        payload: {
          valueToRemove: 'b',
        },
      });
    });

    raf.mockRestore();
  });

  it('disables Save when errorStates contains a message', () => {
    const erroredState: GlobalAttributesPageState = {
      ...baseState,
      errorStates: { 'Group A': 'some error' },
    };

    renderWithProviders(
      <GlobalFacetAttributesEditModal
        globalAttributesLocalState={erroredState}
        dispatch={mockDispatch}
        error="some error"
        handleError={mockHandleError}
        onSave={mockOnSave}
      />
    );

    const saveBtn = screen.getByRole('button', { name: 'Save' });
    expect(saveBtn).toBeDisabled();
  });

  it('calls handleClose (dispatch CLOSE_MERGE_GROUP_MODAL) when last merged value is removed', async () => {
    const singleState: GlobalAttributesPageState = {
      ...baseState,
      merged: [
        {
          displayValue: 'SoloGroup',
          mergedValues: ['solo'],
        },
      ],
      currentMerge: {
        isOpen: true,
        displayValue: 'SoloGroup',
        mergedValues: ['solo'],
      },
    };

    const raf = jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb: any) => cb(0));

    renderWithProviders(
      <GlobalFacetAttributesEditModal
        globalAttributesLocalState={singleState}
        dispatch={mockDispatch}
        error=""
        handleError={mockHandleError}
        onSave={mockOnSave}
      />
    );

    const removeButton = screen.getByLabelText('Remove merged facet for solo');
    await userEvent.click(removeButton);

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'CLOSE_MERGE_GROUP_MODAL',
      });
    });

    raf.mockRestore();
  });
});
