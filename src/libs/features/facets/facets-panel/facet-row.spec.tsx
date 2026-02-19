import { screen } from '@testing-library/react';

import type { FacetRowDisplayValue } from '@/libs/stores/facets-panel/facets-panel-reducer';
import { renderWithProviders } from '@/test/render-with-providers';

import { FacetRow } from './facet-row';

let sortableListeners: Record<string, unknown> | undefined = {};

jest.mock('@/libs/containers/facets/sortable-row/sortable-row', () => ({
  SortableRow: ({
    children,
    id,
  }: {
    children: (sortableProps: Record<string, unknown>) => React.ReactNode;
    id: string;
  }) => (
    <div data-testid={`sortable-row-${id}`}>
      {children({
        setNodeRef: jest.fn(),
        setActivatorNodeRef: jest.fn(),
        listeners: sortableListeners,
        attributes: {},
      })}
    </div>
  ),
}));

const includedFacet: FacetRowDisplayValue = {
  displayType: 'included',
  displayValue: 'color',
  id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
  indexPropertyName: 'color',
  lastChanged: {
    date: '2021-01-01T08:34:15Z',
    user: 'Test User',
  },
  merged: [],
};

const algoControlFacet: FacetRowDisplayValue = {
  ...includedFacet,
  id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a85',
  displayValue: 'size',
  indexPropertyName: 'size',
  displayType: 'algoControl',
};

const createProps = (facet: FacetRowDisplayValue, boostedCount = 2) => ({
  facet,
  errorMessage: '',
  writeEnabled: true,
  boostedCount,
  order: 1,
  localOrder: 1,
  disallowedValues: ['color', 'brand', 'size'],
  showNewFacetValuesPage: false,
  countryCode: 'UK' as const,
  ruleSetId: 'test-ruleset-id',
  setError: jest.fn(),
  onFacetDataChange: jest.fn(),
  onDisplayTypeChange: jest.fn(),
  onOpenFacetEditModal: jest.fn(),
  getInputRef: () => jest.fn(),
  handleInputChange: jest.fn(),
  handleInputBlur: jest.fn(),
  handleInputKeyDown: jest.fn(),
});

describe('FacetRow', () => {
  beforeEach(() => {
    sortableListeners = {};
  });

  it('renders drag handle and sortable wrapper for included facets', () => {
    renderWithProviders(<FacetRow {...createProps(includedFacet)} />);

    expect(
      screen.getByTestId(`sortable-row-${includedFacet.id}`)
    ).toBeInTheDocument();
    expect(screen.getByTestId('drag-handle-color')).toBeVisible();
  });

  it('disables drag handle when there is only one included facet', () => {
    renderWithProviders(<FacetRow {...createProps(includedFacet, 1)} />);

    expect(screen.getByTestId('drag-handle-color')).toBeDisabled();
  });

  it('does not render drag handle for non-included facets', () => {
    renderWithProviders(<FacetRow {...createProps(algoControlFacet)} />);

    expect(
      screen.queryByTestId(`sortable-row-${algoControlFacet.id}`)
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('drag-handle-size')).not.toBeInTheDocument();
  });

  it('handles undefined sortable listeners by falling back to empty object', () => {
    sortableListeners = undefined;

    renderWithProviders(<FacetRow {...createProps(includedFacet)} />);

    expect(screen.getByTestId('drag-handle-color')).toBeVisible();
  });

  it('renders edit values link when showNewFacetValuesPage is enabled', () => {
    renderWithProviders(
      <FacetRow {...createProps(includedFacet)} showNewFacetValuesPage />
    );

    const editValuesLink = screen.getByRole('link', { name: 'Edit values' });

    expect(editValuesLink).toHaveAttribute(
      'href',
      '/global/facets/values/edit/b04eaac3-f4ea-4f21-9459-0b4302dc2a84?ruleSetId=test-ruleset-id&displayName=color&countryCode=UK'
    );
  });

  it('renders view values link when write access is disabled', () => {
    renderWithProviders(
      <FacetRow
        {...createProps(includedFacet)}
        showNewFacetValuesPage
        writeEnabled={false}
      />
    );

    const viewValuesLink = screen.getByRole('link', { name: 'View values' });

    expect(viewValuesLink).toHaveAttribute(
      'href',
      '/global/facets/values/edit/b04eaac3-f4ea-4f21-9459-0b4302dc2a84?ruleSetId=test-ruleset-id&displayName=color&countryCode=UK'
    );
    expect(viewValuesLink).toBeInTheDocument();
  });
});
