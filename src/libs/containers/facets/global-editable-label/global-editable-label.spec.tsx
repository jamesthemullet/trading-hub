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
    jest.mocked(useCheckMergeNameUnique).mockReturnValue({
      checkMergeNameUnique: () =>
        Promise.resolve({
          isUniqueValue: true,
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

    const inputField = await screen.findByLabelText(
      `Edit test attribute input field`
    );

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

    const inputField = await screen.findByLabelText(
      `Edit test attribute input field`
    );

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
});
