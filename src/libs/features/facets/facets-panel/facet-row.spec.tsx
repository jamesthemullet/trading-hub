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

const createProps = (
  facet: FacetRowDisplayValue,
  canReorderIncludedFacets = true
) => ({
  facet,
  errorMessage: '',
  isWriteEnabled: true,
  canReorderIncludedFacets,
  order: 1,
  localOrder: 1,
  isDisplayValueDuplicate: jest.fn(() => false),
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
    renderWithProviders(<FacetRow {...createProps(includedFacet, false)} />);

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

  it('renders edit values link', () => {
    renderWithProviders(<FacetRow {...createProps(includedFacet)} />);

    const editValuesLink = screen.getByRole('link', { name: 'Edit values' });

    const params = new URLSearchParams({
      ruleSetId: 'test-ruleset-id',
      displayName: 'color',
      countryCode: 'UK',
    });
    expect(editValuesLink).toHaveAttribute(
      'href',
      `/global/facets/values/edit/${includedFacet.id}?${params.toString()}`
    );
  });

  it('renders view values link when write access is disabled', () => {
    renderWithProviders(
      <FacetRow {...createProps(includedFacet)} isWriteEnabled={false} />
    );

    const viewValuesLink = screen.getByRole('link', { name: 'View values' });

    const params = new URLSearchParams({
      ruleSetId: 'test-ruleset-id',
      displayName: 'color',
      countryCode: 'UK',
      readOnly: 'true',
    });
    expect(viewValuesLink).toHaveAttribute(
      'href',
      `/global/facets/values/edit/${includedFacet.id}?${params.toString()}`
    );
    expect(viewValuesLink).toBeInTheDocument();
  });
});
