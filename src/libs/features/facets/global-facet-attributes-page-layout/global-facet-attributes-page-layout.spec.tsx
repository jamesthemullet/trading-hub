import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import type { MerchandisingReturnedGlobalFacet } from '@/libs/api';
import { useGlobalFacetUpdate } from '@/libs/hooks';
import { facetsListMock } from '@/pages/api/search/mocks';
import { mockGlobalRuleData } from '@/test/data/mock-use-rule-set-preview.data';
import { renderWithProviders } from '@/test/render-with-providers';

import { GlobalFacetAttributesPageLayout } from './global-facet-attributes-page-layout';

const ruleSetId = '090152b8-2517-4e42-a5f3-48fcab8d9942';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('@/libs/hooks', () => ({
  ...jest.requireActual('@/libs/hooks'),
  useGlobalFacetUpdate: jest.fn(),
}));

const mockRouter = {
  push: jest.fn(),
};

const mockUpdateGlobalFacet = jest.fn(() =>
  Promise.resolve({} as MerchandisingReturnedGlobalFacet | { status: string })
);
const updateGlobalFacet = {
  handleGlobalFacetUpdate: mockUpdateGlobalFacet,
  error: '',
};

describe('GlobalFacetAttributesPageLayout', () => {
  const defaultProps = {
    attributeValues: [
      { displayValue: '13 - 14.4' },
      { displayValue: '10 - 12.9' },
      { displayValue: '14.5 - 20' },
      { displayValue: 'Under 10' },
      { displayValue: 'Over 20' },
    ],
    ruleSetDetail: mockGlobalRuleData,
    facetId: 'color',
    displayName: 'Color',
    facet: facetsListMock.facets[0],
    facetType: 'category' as const,
    ruleSetId,
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.mocked(useGlobalFacetUpdate).mockReturnValue(updateGlobalFacet);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the page layout with default props', () => {
    renderWithProviders(<GlobalFacetAttributesPageLayout {...defaultProps} />);

    expect(screen.getByText('Value settings of: Color')).toBeInTheDocument();
  });

  it('navigates back to global facets page on cancel', async () => {
    const user = userEvent.setup();
    renderWithProviders(<GlobalFacetAttributesPageLayout {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    expect(mockRouter.push).toHaveBeenCalledWith(
      `/global/facets/edit/${ruleSetId}`
    );
  });

  it('opens and confirms the save confirmation modal', async () => {
    const user = userEvent.setup();

    jest.mocked(useGlobalFacetUpdate).mockReturnValue(updateGlobalFacet);

    renderWithProviders(<GlobalFacetAttributesPageLayout {...defaultProps} />);

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Apply action/i })
      ).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /Apply action/i });
    await user.click(confirmButton);

    expect(mockUpdateGlobalFacet).toHaveBeenCalledWith({
      facetId: 'color',
      data: {
        ...defaultProps.facet,
        merged: [
          {
            displayValue: 'test merged group',
            mergedValues: ['merged 1', 'merged 2'],
          },
        ],
        excludedValues: [],
        boosted: [],
      },
    });

    await waitFor(() => {
      expect(screen.queryByText(/Apply action/i)).not.toBeInTheDocument();
    });
  });

  it('should close the confirmation modal when cancel button on modal clicked', async () => {
    const user = userEvent.setup();

    renderWithProviders(<GlobalFacetAttributesPageLayout {...defaultProps} />);

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Apply action/i })
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole('button', { name: 'Close confirmation modal' })
    );

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: /Apply action/i })
      ).not.toBeVisible();
    });
  });

  it('renders the correct number of included, excluded, and algo control values', () => {
    renderWithProviders(<GlobalFacetAttributesPageLayout {...defaultProps} />);

    expect(screen.getByTestId('include-only-count')).toHaveTextContent('0');
    expect(screen.getByTestId('exclude-only-count')).toHaveTextContent('0');
    expect(screen.getByTestId('algo-control-count')).toHaveTextContent('5');
  });

  it('handles error response in onSave', async () => {
    const user = userEvent.setup();

    jest.mocked(useGlobalFacetUpdate).mockReturnValue({
      handleGlobalFacetUpdate: jest.fn().mockResolvedValue({ status: 'error' }),
      error: 'error ',
    });

    renderWithProviders(<GlobalFacetAttributesPageLayout {...defaultProps} />);
    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.queryByText(/Apply action/i)).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByText('Error updating facet: error')
      ).toBeInTheDocument();
    });
  });

  it('calculates algoControlValues correctly for nonzero included/excluded', () => {
    const props = {
      ...defaultProps,
      attributeValues: [
        { displayValue: 'A' },
        { displayValue: 'B' },
        { displayValue: 'C' },
        { displayValue: 'D' },
      ],
      facet: {
        ...defaultProps.facet,
        boosted: ['A'],
        excludedValues: ['B'],
      },
    };
    renderWithProviders(<GlobalFacetAttributesPageLayout {...props} />);
    expect(screen.getByTestId('include-only-count')).toHaveTextContent('1');
    expect(screen.getByTestId('exclude-only-count')).toHaveTextContent('1');
    expect(screen.getByTestId('algo-control-count')).toHaveTextContent('2');
  });
});
