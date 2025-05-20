import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useCheckMergeNameUnique } from '@/libs/hooks/use-check-merge-name-unique';
import { renderWithProviders } from '@/test/render-with-providers';

import { GlobalEditableLabel } from './global-editable-label';

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
  });

  it('should render editable label', () => {
    renderWithProviders(
      <GlobalEditableLabel
        displayName="test attribute"
        editingValues={[]}
        facet={mockFacet}
        boostedRows={[]}
        excludedRows={[]}
        countryCode="UK"
        merged={[]}
        setEditingValues={jest.fn()}
        dispatch={jest.fn()}
      />
    );

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

    const user = userEvent.setup();
    renderWithProviders(
      <GlobalEditableLabel
        displayName="test attribute"
        editingValues={[]}
        facet={mockFacet}
        boostedRows={[]}
        excludedRows={[]}
        countryCode="UK"
        merged={[]}
        setEditingValues={jest.fn()}
        dispatch={dispatchMock}
      />
    );

    const editButton = await screen.findByLabelText(
      `Edit display name for test attribute`
    );

    act(() => {
      editButton.click();
    });

    const inputField = await screen.findByLabelText(
      `Edit test attribute input field`
    );

    expect(inputField).toHaveValue('test attribute');

    await waitFor(async () => {
      await user.clear(inputField);
      await user.type(inputField, 'new name');
      await user.keyboard('{enter}');
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
        isFirstAttributeBoosted: false,
        isFirstAttributeExcluded: false,
      },
    });
  });
});
