import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useGetFacetAttributeValues } from '@/libs/hooks';
import { attributeValuesMock, facetsListMock } from '@/pages/api/search/mocks';
import { renderWithProviders } from '@/test/render-with-providers';

import { FacetsPanel } from './facets-panel';
import type { FacetRowDisplayValue } from './facets-panel-reducer';

jest.mock('@/libs/hooks', () => ({
  ...jest.requireActual('@/libs/hooks'),
  useGetFacetAttributeValues: jest.fn(),
  usePreview: jest.fn(),
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const mockDefaultOrderData = [
  { defaultOrder: 'Include only' },
  { defaultOrder: 'Exclude only' },
  { defaultOrder: 'Exclude only' },
  { defaultOrder: 'Include only' },
  { defaultOrder: 'Include only' },
];

const onSaveSpy = jest.fn();
const onCancelSpy = jest.fn();
const dispatchSpy = jest.fn();

const mockFacetsState: FacetRowDisplayValue[] = [
  {
    displayType: 'included',
    displayValue: 'color',
    id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
    indexPropertyName: 'color',
    lastChanged: {
      date: '2021-01-01T08:34:15Z',
      user: 'Test User',
    },
    merged: [
      {
        displayValue: 'test merged group',
        mergedValues: ['merged 1', 'merged 2'],
      },
    ],
    meta: {
      isBeginningOfDisplayTypeGroup: true,
      isEndOfDisplayTypeGroup: false,
    },
  },
  {
    displayType: 'included',
    displayValue: 'brand',
    id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a86',
    indexPropertyName: 'brand',
    lastChanged: {
      date: '2021-01-03T08:34:15Z',
      user: 'Test User',
    },
    merged: [],
    meta: {
      isBeginningOfDisplayTypeGroup: false,
      isEndOfDisplayTypeGroup: true,
    },
  },
  {
    displayType: 'algoControl',
    displayValue: 'size',
    id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a85',
    indexPropertyName: 'size',
    lastChanged: {
      date: '2021-01-02T08:34:15Z',
      user: 'Test User',
    },
    merged: [],
    meta: {
      isBeginningOfDisplayTypeGroup: true,
      isEndOfDisplayTypeGroup: false,
    },
  },
  {
    displayType: 'algoControl',
    displayValue: 'price',
    id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a88',
    indexPropertyName: 'price',
    lastChanged: {
      date: '2021-01-05T08:34:15Z',
      user: 'Test User',
    },
    merged: [],
    meta: {
      isBeginningOfDisplayTypeGroup: false,
      isEndOfDisplayTypeGroup: true,
    },
  },
  {
    displayType: 'excluded',
    displayValue: 'category',
    id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a87',
    indexPropertyName: 'category',
    lastChanged: {
      date: '2021-01-04T08:34:15Z',
      user: 'Test User',
    },
    merged: [],
    meta: {
      isBeginningOfDisplayTypeGroup: true,
      isEndOfDisplayTypeGroup: true,
    },
  },
];

const mockIncludedFacets = [
  facetsListMock.facets[0],
  facetsListMock.facets[2],
  facetsListMock.facets[3],
];
const mockExcludedFacets = {
  facets: [{ id: facetsListMock.facets[1].id }],
};

describe('Facet Panel', () => {
  beforeEach(() => {
    jest.mocked(useGetFacetAttributeValues).mockReturnValue({
      attributeValues: attributeValuesMock,
      error: '',
      isLoading: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the facet management editing page', async () => {
    renderWithProviders(
      <FacetsPanel
        writeEnabled={true}
        title="Facet Rule Editor"
        countryCode="UK_IE"
        selectedPreviewCountryCode="UK"
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        onFacetDataChange={jest.fn()}
        facetsState={mockFacetsState}
        includedFacets={mockIncludedFacets}
        excludedFacets={mockExcludedFacets}
        dispatch={dispatchSpy}
        refreshData={jest.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Facet Rule Editor' })
    ).toBeVisible();
  });

  it('should not render preview button or add new facets button', async () => {
    renderWithProviders(
      <FacetsPanel
        writeEnabled={true}
        title="Facet Rule Editor"
        countryCode="UK_IE"
        selectedPreviewCountryCode="UK"
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        onFacetDataChange={jest.fn()}
        facetsState={mockFacetsState}
        includedFacets={mockIncludedFacets}
        excludedFacets={mockExcludedFacets}
        dispatch={dispatchSpy}
        refreshData={jest.fn()}
      />
    );

    expect(
      screen.queryByRole('button', { name: 'Preview' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Add new facet' })
    ).not.toBeInTheDocument();
  });

  it('should render column headings', () => {
    renderWithProviders(
      <FacetsPanel
        writeEnabled={true}
        title="Facet Rule Editor"
        countryCode="UK_IE"
        selectedPreviewCountryCode="UK"
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        onFacetDataChange={jest.fn()}
        facetsState={mockFacetsState}
        includedFacets={mockIncludedFacets}
        excludedFacets={mockExcludedFacets}
        dispatch={dispatchSpy}
        refreshData={jest.fn()}
      />
    );

    expect(screen.getByText('Attribute')).toBeVisible();
    expect(screen.getByText('Display name')).toBeVisible();
    expect(screen.getByText('Order')).toBeVisible();
    expect(screen.getByText('Value options')).toBeVisible();
  });

  it('should handle order change when button down is clicked', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <FacetsPanel
        writeEnabled={true}
        title="Facet Rule Editor"
        countryCode="UK_IE"
        selectedPreviewCountryCode="UK"
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        displayRowOrderControls={true}
        onFacetDataChange={jest.fn()}
        facetsState={mockFacetsState}
        includedFacets={mockIncludedFacets}
        excludedFacets={mockExcludedFacets}
        dispatch={dispatchSpy}
        refreshData={jest.fn()}
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'Move color row down' })
    );

    expect(dispatchSpy).toHaveBeenCalledWith({
      payload: { id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84' },
      type: 'MOVE_INCLUDED_ROW_DOWN',
    });
  });

  it('should handle order change when button up is clicked', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <FacetsPanel
        writeEnabled={true}
        title="Facet Rule Editor"
        countryCode="UK_IE"
        selectedPreviewCountryCode="UK"
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        displayRowOrderControls={true}
        onFacetDataChange={jest.fn()}
        facetsState={mockFacetsState}
        includedFacets={mockIncludedFacets}
        excludedFacets={mockExcludedFacets}
        dispatch={dispatchSpy}
        refreshData={jest.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Move brand row up' }));

    expect(dispatchSpy).toHaveBeenCalledWith({
      payload: { id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a86' },
      type: 'MOVE_INCLUDED_ROW_UP',
    });
  });

  it('should highlight the row in the correct background colour depending on whether exclude/include only is selected', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <FacetsPanel
        writeEnabled={true}
        title="Facet Rule Editor"
        countryCode="UK"
        selectedPreviewCountryCode="UK"
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        defaultOrderData={mockDefaultOrderData}
        facetsState={mockFacetsState}
        includedFacets={mockIncludedFacets}
        excludedFacets={mockExcludedFacets}
        dispatch={dispatchSpy}
        refreshData={jest.fn()}
        onFacetDataChange={jest.fn()}
      />
    );

    const dropdown = screen.getAllByTestId(
      'button to open facet order dropdown'
    )[0];

    await user.click(dropdown);
    const includeOnlyOption = screen.getAllByText('Include only')[0];

    await user.click(includeOnlyOption);

    expect(screen.getAllByTestId(/Row showing/)[0]).toHaveStyle(
      'background-color: #f4faed'
    );

    await user.click(dropdown);
    const excludeOnlyOption = screen.getAllByText('Exclude only')[0];

    await user.click(excludeOnlyOption);
    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith({
        payload: {
          id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
          newDisplayType: 'excluded',
        },
        type: 'CHANGE_DISPLAY_TYPE',
      });
    });
  });

  describe('Edit Facet Values Modal', () => {
    it('should open the modal', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <FacetsPanel
          writeEnabled={true}
          title="Facet Rule Editor"
          countryCode="UK"
          selectedPreviewCountryCode="UK"
          onSave={onSaveSpy}
          onCancel={onCancelSpy}
          refreshData={jest.fn()}
          onFacetDataChange={jest.fn()}
          facetsState={mockFacetsState}
          includedFacets={mockIncludedFacets}
          excludedFacets={mockExcludedFacets}
          dispatch={dispatchSpy}
        />
      );

      const editFacetValuesButton = (
        await screen.findAllByText('Edit values')
      )[0];

      expect(editFacetValuesButton).toBeVisible();

      user.click(editFacetValuesButton);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', {
            level: 3,
            name: 'Facet value settings of: color',
          })
        ).toBeVisible();
      });
    });

    it('should close the modal on click of the close button', async () => {
      const user = userEvent.setup({ delay: null });
      const refreshMock = jest.fn();

      renderWithProviders(
        <FacetsPanel
          writeEnabled={true}
          title="Facet Rule Editor"
          countryCode="UK"
          selectedPreviewCountryCode="UK"
          onSave={onSaveSpy}
          onCancel={onCancelSpy}
          onFacetDataChange={jest.fn()}
          facetsState={mockFacetsState}
          includedFacets={mockIncludedFacets}
          excludedFacets={mockExcludedFacets}
          dispatch={dispatchSpy}
          refreshData={refreshMock}
        />
      );

      const editFacetValuesButton = screen.getAllByText('Edit values')[0];

      act(() => {
        editFacetValuesButton.click();
      });

      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'Facet value settings of: color',
        })
      ).toBeVisible();

      const closeButton = screen.getAllByRole('button', { name: 'Cancel' })[1];

      act(() => {
        user.click(closeButton);
      });

      await waitFor(async () => {
        expect(
          screen.queryAllByRole('heading', {
            level: 3,
            name: 'Facet value settings of: color',
          }).length
        ).toBe(0);
      });
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  it('should not allow renaming a row to an existing value', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(
      <FacetsPanel
        writeEnabled={true}
        title="Facet Rule Editor"
        countryCode="UK"
        selectedPreviewCountryCode="UK"
        onFacetDataChange={jest.fn()}
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        refreshData={jest.fn()}
        facetsState={mockFacetsState}
        includedFacets={mockIncludedFacets}
        excludedFacets={mockExcludedFacets}
        dispatch={dispatchSpy}
      />
    );

    const editButton = await screen.findByLabelText(
      `Edit display name for color`
    );

    act(() => {
      editButton.click();
    });

    const inputField = await screen.findByLabelText(`Edit color input field`);

    expect(inputField).toHaveValue('color');

    await user.clear(inputField);
    await user.type(inputField, 'brand');
    await user.keyboard('{enter}');

    const errorMessage = screen.getByText(`brand is not a unique value`);
    expect(errorMessage).toBeVisible();

    const cancelButton = screen.getByLabelText(`Cancel color change`);
    act(() => {
      cancelButton.click();
    });
    expect(errorMessage).not.toBeVisible();
  });
});
