import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';

import type { MerchandisingReturnedGlobalFacet } from '@/libs/api';
import { useGetFacetAttributeValues, useGlobalFacetUpdate } from '@/libs/hooks';
import type { FacetRowDisplayValue } from '@/libs/stores/facets-panel/facets-panel-reducer';
import { attributeValuesMock, facetsListMock } from '@/pages/api/search/mocks';
import { renderWithProviders } from '@/test/render-with-providers';

import { FacetsPanel } from './facets-panel';

jest.mock('@/libs/hooks', () => ({
  ...jest.requireActual('@/libs/hooks'),
  useGetFacetAttributeValues: jest.fn(),
  usePreview: jest.fn(),
  useGlobalFacetUpdate: jest.fn(),
}));

const pushMock = jest.fn();

const mockRouter: Partial<NextRouter> = {
  query: { id: 'test-ruleset-id' },
  push: pushMock,
  route: '',
  pathname: '',
  asPath: '',
  basePath: '',
  isLocaleDomain: false,
};

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

const mockUpdateGlobalFacet = jest.fn(() =>
  Promise.resolve({} as MerchandisingReturnedGlobalFacet | { status: string })
);
const updateGlobalFacet = {
  handleGlobalFacetUpdate: mockUpdateGlobalFacet,
  error: '',
};

const defaultProps = {
  writeEnabled: true,
  title: 'Facet Rule Editor',
  countryCode: 'UK_IE' as const,
  selectedPreviewCountryCode: 'UK' as const,
  onSave: onSaveSpy,
  onCancel: onCancelSpy,
  onFacetDataChange: jest.fn(),
  facetsState: mockFacetsState,
  includedFacets: mockIncludedFacets,
  excludedFacets: mockExcludedFacets,
  dispatch: dispatchSpy,
  refreshData: jest.fn(),
};

describe('Facet Panel', () => {
  beforeEach(() => {
    jest.mocked(useGetFacetAttributeValues).mockReturnValue({
      attributeValues: attributeValuesMock,
      error: '',
      isLoading: false,
    });
    jest.mocked(useGlobalFacetUpdate).mockReturnValue(updateGlobalFacet);
    jest.mocked(useRouter).mockReturnValue(mockRouter as NextRouter);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should render the facet management editing page', async () => {
    renderWithProviders(<FacetsPanel {...defaultProps} />);

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Facet Rule Editor' })
    ).toBeVisible();
  });

  it('should not render preview button or add new facets button', async () => {
    renderWithProviders(<FacetsPanel {...defaultProps} />);

    expect(
      screen.queryByRole('button', { name: 'Preview' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Add new facet' })
    ).not.toBeInTheDocument();
  });

  it('should render column headings', () => {
    renderWithProviders(<FacetsPanel {...defaultProps} />);

    expect(screen.getByText('Attribute')).toBeVisible();
    expect(screen.getByText('Display name')).toBeVisible();
    expect(screen.getByText('Order')).toBeVisible();
    expect(screen.getByText('Value options')).toBeVisible();
  });

  it('should handle order change when button down is clicked', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <FacetsPanel {...defaultProps} displayRowOrderControls />
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
      <FacetsPanel {...defaultProps} displayRowOrderControls />
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
        {...defaultProps}
        countryCode="UK"
        defaultOrderData={mockDefaultOrderData}
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
      jest.useRealTimers();
      const user = userEvent.setup();

      renderWithProviders(<FacetsPanel {...defaultProps} countryCode="UK" />);

      const editFacetValuesButton = screen.getAllByRole('button', {
        name: 'Edit values',
      })[0];

      expect(editFacetValuesButton).toBeVisible();

      await user.click(editFacetValuesButton);

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
          {...defaultProps}
          countryCode="UK"
          refreshData={refreshMock}
        />
      );

      const editFacetValuesButton = screen.getAllByRole('button', {
        name: 'Edit values',
      })[0];

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

      await user.click(closeButton);

      await waitFor(async () => {
        expect(
          screen.queryAllByRole('heading', {
            level: 3,
            name: 'Facet value settings of: color',
          }).length
        ).toBe(0);
      });
      expect(refreshMock).not.toHaveBeenCalled();
    });

    it('should close the modal and refetch on click of the save button', async () => {
      const user = userEvent.setup({ delay: null });
      const refreshMock = jest.fn();

      renderWithProviders(
        <FacetsPanel
          {...defaultProps}
          countryCode="UK"
          refreshData={refreshMock}
        />
      );

      const editFacetValuesButton = screen.getAllByRole('button', {
        name: 'Edit values',
      })[0];

      await user.click(editFacetValuesButton);

      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'Facet value settings of: color',
        })
      ).toBeVisible();

      const modal = screen.getByLabelText('Edit facet values modal');
      expect(modal).toBeVisible();
      const saveButton = within(modal).getAllByRole('button', {
        name: 'Save',
      })[0];

      await user.click(saveButton);

      const heading = await screen.findByRole('heading', {
        name: 'Apply global changes',
      });
      expect(heading).toBeVisible();

      await user.click(screen.getByRole('button', { name: 'Apply action' }));

      await waitFor(() => {
        expect(refreshMock).toHaveBeenCalled();
      });
    });
  });

  it('should not allow renaming a row to an existing value', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<FacetsPanel {...defaultProps} countryCode="UK" />);

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

  it('should route the user to the facet values page if showNewFacetValuesPage is true', async () => {
    renderWithProviders(
      <FacetsPanel {...defaultProps} countryCode="UK" />,
      [],
      {
        featureFlags: {
          showNewFacetValuesPage: true,
        },
      }
    );

    const editFacetValuesButton = screen.getAllByRole('link', {
      name: 'Edit values',
    })[0];

    expect(editFacetValuesButton).toHaveAttribute(
      'href',
      '/global/facets/values/edit/b04eaac3-f4ea-4f21-9459-0b4302dc2a84?ruleSetId=test-ruleset-id&displayName=color&countryCode=UK'
    );
  });

  it('should render view values button with no write access', async () => {
    renderWithProviders(
      <FacetsPanel {...defaultProps} writeEnabled={false} countryCode="UK" />,
      [],
      {
        featureFlags: {
          showNewFacetValuesPage: true,
        },
      }
    );

    const viewFacetValuesButton = screen.getAllByRole('link', {
      name: 'View values',
    })[0];

    expect(viewFacetValuesButton).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Edit Values' })
    ).not.toBeInTheDocument();
  });
});
