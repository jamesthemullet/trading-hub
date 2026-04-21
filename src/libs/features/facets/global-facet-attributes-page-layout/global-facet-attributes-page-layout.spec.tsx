import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import type { MerchandisingReturnedGlobalFacet } from '@/libs/api';
import { FacetType } from '@/libs/constants/rule-types';
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
  Promise.resolve({ status: 'success' } as
    | MerchandisingReturnedGlobalFacet
    | { status: string })
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
    facetType: FacetType.Category,
    searchQuery: '',
    onSearchChange: jest.fn(),
    ruleSetId,
    countryCode: 'UK_IE' as const,
    isWriteEnabled: true,
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
    renderWithProviders(
      <GlobalFacetAttributesPageLayout
        {...defaultProps}
        facet={facetsListMock.facets[1]}
      />
    );

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
        excludedValues: ['Ducky Downy'],
        boosted: ['Cotton', 'Duck Down'],
      },
    });

    await waitFor(
      () => {
        expect(screen.queryByText(/Apply action/i)).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );
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
      expect(
        screen.getByRole('button', { name: /Apply action/i })
      ).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /Apply action/i });
    await user.click(confirmButton);

    await waitFor(
      () => {
        expect(screen.queryByText(/Apply action/i)).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    await waitFor(() => {
      expect(
        screen.getByText('Error updating facet: error')
      ).toBeInTheDocument();
    });
  });

  it('handles merging of two attribute values', async () => {
    const user = userEvent.setup();

    renderWithProviders(<GlobalFacetAttributesPageLayout {...defaultProps} />);

    const attributeA = screen.getByLabelText('Select 13 - 14.4 to merge');
    const attributeB = screen.getByLabelText('Select 10 - 12.9 to merge');

    await user.click(attributeA);
    await user.click(attributeB);

    const mergeButton = screen.getByRole('button', { name: 'Merge' });
    await waitFor(() => {
      expect(mergeButton).toBeEnabled();
    });
    await user.click(mergeButton);

    await waitFor(() => {
      expect(screen.getByText('Edit merge')).toBeInTheDocument();
    });

    expect(
      screen.getByLabelText('Remove merged facet for 13 - 14.4')
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Remove merged facet for 10 - 12.9')
    ).toBeInTheDocument();
  });

  it('handles merge of boosted, excluded and non-boosted values (covers selectedRows assembly)', async () => {
    const user = userEvent.setup();

    const props = {
      ...defaultProps,
      facet: {
        ...defaultProps.facet,
        boosted: ['13 - 14.4'],
        excludedValues: ['Over 20'],
      },
      attributeValues: [
        { displayValue: '13 - 14.4' },
        { displayValue: '10 - 12.9' },
        { displayValue: '14.5 - 20' },
        { displayValue: 'Under 10' },
        { displayValue: 'Over 20' },
      ],
    } as typeof defaultProps;

    renderWithProviders(<GlobalFacetAttributesPageLayout {...props} />);

    const boostedCheckbox = screen.getByLabelText('Select 13 - 14.4 to merge');
    const algoCheckbox = screen.getByLabelText('Select 14.5 - 20 to merge');
    const excludedCheckbox = screen.getByLabelText('Select Over 20 to merge');

    await user.click(boostedCheckbox);
    await user.click(algoCheckbox);
    await user.click(excludedCheckbox);

    const mergeButton = screen.getByRole('button', { name: 'Merge' });
    await waitFor(() => {
      expect(mergeButton).toBeEnabled();
    });
    await user.click(mergeButton);

    await waitFor(() => {
      expect(screen.getByText('Edit merge')).toBeInTheDocument();
    });

    expect(
      screen.getByLabelText('Remove merged facet for 13 - 14.4')
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Remove merged facet for 14.5 - 20')
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Remove merged facet for Over 20')
    ).toBeInTheDocument();
  });

  it('handles merge groups correctly in onSave', async () => {
    const user = userEvent.setup();

    renderWithProviders(<GlobalFacetAttributesPageLayout {...defaultProps} />);

    const mergeGroup = [
      {
        displayValue: 'test merged group',
        mergedValues: ['merged 1', 'merged 2'],
      },
    ];

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
        merged: mergeGroup,
        excludedValues: ['Ducky Downy'],
        boosted: ['Cotton', 'Duck Down'],
      },
    });

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith(
        `/global/facets/edit/${ruleSetId}`
      );
    });
  });
});
