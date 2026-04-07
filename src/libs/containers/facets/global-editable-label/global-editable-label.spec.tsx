import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { MerchandisingCountryCode } from '@/libs/api/generated/open-api';
import { useCheckMergeNameUnique } from '@/libs/hooks/use-check-merge-name-unique';
import { renderWithProviders } from '@/test/render-with-providers';

import { GlobalEditableLabel } from './global-editable-label';

const debounceTime = 100;

const mockFacet = {
  displayName: 'test attribute',
  type: 'global-only',
  isEnabled: true,
  countryCode: 'UK',
  merged: [],
  indexPropertyName: 'test',
  excludedFacets: [],
  displayValue: 'test attribute',
  displayType: 'included',
  id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
  lastChanged: {
    date: '2021-01-01T08:34:15Z',
    user: 'Test User',
  },
};

const dispatchMock = jest.fn();

const defaultProps = {
  displayName: 'test attribute',
  editingValues: [],
  facet: mockFacet,
  boostedRows: [],
  nonBoostedExcludedRows: [],
  excludedRows: [],
  countryCode: 'UK' as MerchandisingCountryCode,
  merged: [],
  setEditingValues: jest.fn(),
  dispatch: dispatchMock,
  writeEnabled: true,
};

jest.mock('@/libs/hooks/use-check-merge-name-unique', () => ({
  ...jest.requireActual('@/libs/hooks/use-check-merge-name-unique'),
  useCheckMergeNameUnique: jest.fn(),
}));

describe('Global Editable label', () => {
  beforeEach(() => {
    dispatchMock.mockClear();
    jest.mocked(useCheckMergeNameUnique).mockReturnValue({
      checkMergeNameUnique: () =>
        Promise.resolve({
          isUniqueValue: true,
          error: undefined,
        }),
      error: '',
    });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render editable label', () => {
    renderWithProviders(<GlobalEditableLabel {...defaultProps} />);

    expect(screen.getByText('test attribute')).toBeVisible();
    expect(
      screen.getByRole('button', {
        name: 'Edit display name for test attribute',
      })
    ).toBeVisible();
  });

  it('should create "faux" merge group if renaming a single attribute', async () => {
    jest.mocked(useCheckMergeNameUnique).mockReturnValue({
      checkMergeNameUnique: jest.fn().mockResolvedValue({
        isUniqueValue: true,
        error: undefined,
      }),
      error: '',
    });

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWithProviders(
      <GlobalEditableLabel
        {...defaultProps}
        excludedRows={[
          {
            displayName: 'test attribute 2',
            attributes: ['test attribute 2'],
            isMergeGroup: false,
            isChecked: false,
          },
        ]}
      />
    );

    const editButton = await screen.findByLabelText(
      `Edit display name for test attribute`
    );

    await user.click(editButton);

    await act(async () => {
      jest.advanceTimersByTime(debounceTime);
    });

    const inputField = await screen.findByRole('textbox', {
      name: `Edit test attribute input field`,
    });

    expect(inputField).toHaveValue('test attribute');

    await user.clear(inputField);
    await user.type(inputField, 'new name');

    await user.keyboard('{enter}');

    await act(async () => {
      jest.advanceTimersByTime(debounceTime);
    });

    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'AMEND_DISPLAY_NAME',
      payload: {
        oldValue: 'test attribute',
        newValue: 'new name',
      },
    });

    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'CREATE_MERGE_GROUP',
      payload: {
        attributes: ['new name'],
        displayValue: 'new name',
        isFirstAttributeBoosted: false,
        isFirstAttributeExcluded: false,
      },
    });
  });

  it('should not update the name if the value is unchanged', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWithProviders(<GlobalEditableLabel {...defaultProps} />);

    const editButton = await screen.findByLabelText(
      `Edit display name for test attribute`
    );

    await user.click(editButton);

    act(() => {
      jest.advanceTimersByTime(debounceTime);
    });

    const inputField = await screen.findByRole('textbox', {
      name: `Edit test attribute input field`,
    });

    expect(inputField).toHaveValue('test attribute');

    await user.clear(inputField);
    await user.type(inputField, 'test attribute');

    await user.keyboard('{enter}');

    act(() => {
      jest.advanceTimersByTime(debounceTime);
    });

    expect(dispatchMock).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'AMEND_DISPLAY_NAME',
      })
    );
  });

  it('should show error when new name exists in another merge group', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWithProviders(
      <GlobalEditableLabel
        {...defaultProps}
        merged={[
          {
            displayValue: 'other group',
            mergedValues: ['other group', 'duplicate name'],
          },
          {
            displayValue: 'another group',
            mergedValues: ['another group'],
          },
        ]}
      />
    );

    const editButton = await screen.findByLabelText(
      `Edit display name for test attribute`
    );

    await user.click(editButton);

    await act(async () => {
      jest.advanceTimersByTime(debounceTime);
    });

    const inputField = await screen.findByRole('textbox', {
      name: `Edit test attribute input field`,
    });

    await user.clear(inputField);
    await user.type(inputField, 'duplicate name');

    await user.keyboard('{enter}');

    await act(async () => {
      jest.advanceTimersByTime(debounceTime);
    });

    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'SET_ERROR',
      payload: {
        displayName: 'test attribute',
        message: 'duplicate name is not a unique value',
      },
    });

    expect(dispatchMock).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'AMEND_DISPLAY_NAME',
      })
    );
  });

  it('should show error when checkMergeNameUnique returns false', async () => {
    jest.mocked(useCheckMergeNameUnique).mockReturnValue({
      checkMergeNameUnique: jest.fn().mockResolvedValue({
        isUniqueValue: false,
        error: undefined,
      }),
      error: '',
    });

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWithProviders(<GlobalEditableLabel {...defaultProps} />);

    const editButton = await screen.findByLabelText(
      `Edit display name for test attribute`
    );

    await user.click(editButton);

    await act(async () => {
      jest.advanceTimersByTime(debounceTime);
    });

    const inputField = await screen.findByRole('textbox', {
      name: `Edit test attribute input field`,
    });

    await user.clear(inputField);
    await user.type(inputField, 'non unique name');

    await user.keyboard('{enter}');

    await act(async () => {
      jest.advanceTimersByTime(debounceTime);
    });

    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'SET_ERROR',
      payload: {
        displayName: 'test attribute',
        message: 'non unique name is not a unique value',
      },
    });

    expect(dispatchMock).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'AMEND_DISPLAY_NAME',
      })
    );
  });

  it('should pass exceptions when editing an existing merge group', async () => {
    const checkMergeNameUniqueMock = jest.fn().mockResolvedValue({
      isUniqueValue: true,
      error: undefined,
    });

    jest.mocked(useCheckMergeNameUnique).mockReturnValue({
      checkMergeNameUnique: checkMergeNameUniqueMock,
      error: '',
    });

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWithProviders(
      <GlobalEditableLabel
        {...defaultProps}
        merged={[
          {
            displayValue: 'test attribute',
            mergedValues: ['test attribute', 'merged value'],
          },
        ]}
      />
    );

    const editButton = await screen.findByLabelText(
      `Edit display name for test attribute`
    );

    await user.click(editButton);

    await act(async () => {
      jest.advanceTimersByTime(debounceTime);
    });

    const inputField = await screen.findByRole('textbox', {
      name: `Edit test attribute input field`,
    });

    await user.clear(inputField);
    await user.type(inputField, 'renamed group');

    await user.keyboard('{enter}');

    await act(async () => {
      jest.advanceTimersByTime(debounceTime);
    });

    expect(checkMergeNameUniqueMock).toHaveBeenCalledWith(
      expect.objectContaining({
        exceptions: ['test attribute', 'merged value'],
      })
    );

    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'AMEND_DISPLAY_NAME',
      payload: {
        oldValue: 'test attribute',
        newValue: 'renamed group',
      },
    });

    expect(dispatchMock).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'CREATE_MERGE_GROUP',
      })
    );
  });

  it('should clear error when onCancel is called', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWithProviders(<GlobalEditableLabel {...defaultProps} />);

    const editButton = await screen.findByLabelText(
      `Edit display name for test attribute`
    );

    await user.click(editButton);

    await act(async () => {
      jest.advanceTimersByTime(debounceTime);
    });

    const inputField = await screen.findByRole('textbox', {
      name: `Edit test attribute input field`,
    });

    await user.clear(inputField);

    await user.keyboard('{Escape}');

    await act(async () => {
      jest.advanceTimersByTime(debounceTime);
    });

    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'SET_ERROR',
      payload: {
        displayName: 'test attribute',
        message: '',
      },
    });
  });

  it('should show error when value is cleared to empty', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWithProviders(<GlobalEditableLabel {...defaultProps} />);

    const editButton = await screen.findByLabelText(
      `Edit display name for test attribute`
    );

    await user.click(editButton);

    await act(async () => {
      jest.advanceTimersByTime(debounceTime);
    });

    const inputField = await screen.findByRole('textbox', {
      name: `Edit test attribute input field`,
    });

    await user.clear(inputField);

    await act(async () => {
      jest.advanceTimersByTime(debounceTime);
    });

    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'SET_ERROR',
      payload: {
        displayName: 'test attribute',
        message: 'You must supply a value',
      },
    });
  });

  it('should set isFirstAttributeBoosted to true when renaming a boosted attribute', async () => {
    jest.mocked(useCheckMergeNameUnique).mockReturnValue({
      checkMergeNameUnique: jest.fn().mockResolvedValue({
        isUniqueValue: true,
        error: undefined,
      }),
      error: '',
    });

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWithProviders(
      <GlobalEditableLabel
        {...defaultProps}
        editingValues={['test attribute']}
        boostedRows={[
          {
            displayName: 'test attribute',
            attributes: ['test attribute'],
            isMergeGroup: false,
            isChecked: false,
          },
        ]}
      />
    );

    const inputField = await screen.findByRole('textbox', {
      name: `Edit test attribute input field`,
    });

    await user.clear(inputField);
    await user.type(inputField, 'renamed boosted');

    await user.keyboard('{enter}');

    await act(async () => {
      jest.advanceTimersByTime(debounceTime);
    });

    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'CREATE_MERGE_GROUP',
      payload: {
        attributes: ['renamed boosted'],
        displayValue: 'renamed boosted',
        isFirstAttributeBoosted: true,
        isFirstAttributeExcluded: false,
      },
    });
  });

  it('should set isFirstAttributeExcluded to true when renaming an excluded attribute', async () => {
    jest.useRealTimers();
    jest.mocked(useCheckMergeNameUnique).mockReturnValue({
      checkMergeNameUnique: jest.fn().mockResolvedValue({
        isUniqueValue: true,
        error: undefined,
      }),
      error: '',
    });

    const user = userEvent.setup();
    renderWithProviders(
      <GlobalEditableLabel
        {...defaultProps}
        editingValues={['test attribute']}
        excludedRows={[
          {
            displayName: 'test attribute',
            attributes: ['test attribute'],
            isMergeGroup: false,
            isChecked: false,
          },
        ]}
      />
    );

    const inputField = await screen.findByRole('textbox', {
      name: `Edit test attribute input field`,
    });

    await user.clear(inputField);
    await user.type(inputField, 'renamed excluded');

    await user.keyboard('{enter}');
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'CREATE_MERGE_GROUP',
      payload: {
        attributes: ['renamed excluded'],
        displayValue: 'renamed excluded',
        isFirstAttributeBoosted: false,
        isFirstAttributeExcluded: true,
      },
    });

    jest.useFakeTimers();
  });

  it('should include nonBoostedExcludedRows in localAttributeValues when checking uniqueness', async () => {
    const checkMergeNameUniqueMock = jest.fn().mockResolvedValue({
      isUniqueValue: true,
      error: undefined,
    });

    jest.mocked(useCheckMergeNameUnique).mockReturnValue({
      checkMergeNameUnique: checkMergeNameUniqueMock,
      error: '',
    });

    jest.useRealTimers();
    const user = userEvent.setup();
    renderWithProviders(
      <GlobalEditableLabel
        {...defaultProps}
        editingValues={['test attribute']}
        nonBoostedExcludedRows={[
          {
            displayName: 'non boosted excluded',
            attributes: ['non boosted excluded'],
            isMergeGroup: false,
            isChecked: false,
          },
        ]}
      />
    );

    const inputField = await screen.findByRole('textbox', {
      name: `Edit test attribute input field`,
    });

    await user.clear(inputField);
    await user.type(inputField, 'new name');

    await user.keyboard('{enter}');

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(checkMergeNameUniqueMock).toHaveBeenCalledWith(
      expect.objectContaining({
        localAttributeValues: expect.arrayContaining(['non boosted excluded']),
      })
    );

    jest.useFakeTimers();
  });

  it('should call setEditingValues to remove displayName after submitting', async () => {
    jest.mocked(useCheckMergeNameUnique).mockReturnValue({
      checkMergeNameUnique: jest.fn().mockResolvedValue({
        isUniqueValue: true,
        error: undefined,
      }),
      error: '',
    });

    jest.useRealTimers();
    const setEditingValuesMock = jest.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <GlobalEditableLabel
        {...defaultProps}
        editingValues={['test attribute']}
        setEditingValues={setEditingValuesMock}
      />
    );

    const inputField = await screen.findByRole('textbox', {
      name: `Edit test attribute input field`,
    });

    await user.clear(inputField);
    await user.type(inputField, 'new name');

    await user.keyboard('{enter}');

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
    expect(setEditingValuesMock).toHaveBeenCalled();
    const filterFn = setEditingValuesMock.mock.calls[0][0];
    const result = filterFn(['test attribute', 'other']);
    expect(result).toEqual(['other']);

    jest.useFakeTimers();
  });

  it('should call setError when cancel button is clicked in EditableLabel', async () => {
    jest.useRealTimers();
    const user = userEvent.setup();
    renderWithProviders(
      <GlobalEditableLabel
        {...defaultProps}
        editingValues={['test attribute']}
      />
    );

    const cancelButton = await screen.findByLabelText(
      `Cancel test attribute change`
    );

    await user.click(cancelButton);

    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'SET_ERROR',
      payload: {
        displayName: 'test attribute',
        message: '',
      },
    });

    jest.useFakeTimers();
  });
});
