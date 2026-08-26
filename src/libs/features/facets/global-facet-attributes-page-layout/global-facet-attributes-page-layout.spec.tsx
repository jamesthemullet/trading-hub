import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import type { MerchandisingReturnedGlobalFacet } from '@/libs/api';
import { FacetType } from '@/libs/constants/rule-types';
import { useCheckMergeNameUnique, useGlobalFacetUpdate } from '@/libs/hooks';
import type { UseGlobalFacetUpdate } from '@/libs/hooks/global/facets/use-global-facet-update';
import type { SaveResult } from '@/libs/hooks/use-optimistic-update';
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
  useCheckMergeNameUnique: jest.fn(),
}));

const mockRouter = {
  push: jest.fn(),
  reload: jest.fn(),
};

const successResult: SaveResult<MerchandisingReturnedGlobalFacet> = {
  status: 'success',
};
const mockUpdateGlobalFacet = jest.fn().mockResolvedValue(successResult);
const updateGlobalFacet: UseGlobalFacetUpdate = {
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
    jest.mocked(useCheckMergeNameUnique).mockReturnValue({
      error: '',
      checkMergeNameUnique: jest
        .fn()
        .mockResolvedValue({ isUniqueValue: true, error: undefined }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the page layout with default props', () => {
    renderWithProviders(<GlobalFacetAttributesPageLayout {...defaultProps} />);

    expect(screen.getByText('Value settings of: Color')).toBeInTheDocument();
  });

  it('uses default country code when countryCode is undefined', () => {
    renderWithProviders(
      <GlobalFacetAttributesPageLayout
        {...defaultProps}
        countryCode={undefined}
      />
    );

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

    expect(mockRouter.push).toHaveBeenCalledWith(`/global/facet-config`);
  });

  it('navigates back to facet config on cancel (default props)', async () => {
    const user = userEvent.setup();
    renderWithProviders(<GlobalFacetAttributesPageLayout {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    expect(mockRouter.push).toHaveBeenCalledWith('/global/facet-config');
  });

  describe('unsaved changes modal', () => {
    const makeChange = async (user: ReturnType<typeof userEvent.setup>) => {
      const boostedRow = screen.getByTestId('included attribute 0 Cotton');
      const dropdownButton = within(boostedRow).getByRole('button', {
        name: /select to set as included, excluded or algo control/i,
      });
      await user.click(dropdownButton);
      const excludeOption = within(boostedRow).getByRole('menuitemradio', {
        name: /exclude only/i,
      });
      await user.click(excludeOption);
    };

    it('shows modal when closing with unsaved changes', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <GlobalFacetAttributesPageLayout {...defaultProps} />
      );

      await makeChange(user);
      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(
        await screen.findByRole('heading', {
          name: 'Close without saving edits',
        })
      ).toBeInTheDocument();
    });

    it('navigates away when confirming close without saving', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <GlobalFacetAttributesPageLayout {...defaultProps} />
      );

      await makeChange(user);
      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      await user.click(
        await screen.findByRole('button', { name: 'Close without saving' })
      );

      expect(mockRouter.push).toHaveBeenCalledWith(`/global/facet-config`);
    });

    it('dismisses modal when continuing editing', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <GlobalFacetAttributesPageLayout {...defaultProps} />
      );

      await makeChange(user);
      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      await user.click(
        await screen.findByRole('button', { name: 'Continue editing' })
      );

      await waitFor(() => {
        expect(
          screen.queryByRole('heading', {
            name: 'Close without saving edits',
          })
        ).not.toBeInTheDocument();
      });
    });
  });

  it('opens and confirms the save confirmation modal', async () => {
    const user = userEvent.setup();

    jest.mocked(useGlobalFacetUpdate).mockReturnValue(updateGlobalFacet);

    renderWithProviders(<GlobalFacetAttributesPageLayout {...defaultProps} />);

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    const dialog = await screen.findByRole('dialog');
    const confirmButton = within(dialog).getByRole('button', {
      name: 'Save changes',
    });
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
      shouldUseV1: false,
    });

    await waitFor(
      () => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('should close the review modal when cancel button on modal clicked', async () => {
    const user = userEvent.setup();

    renderWithProviders(<GlobalFacetAttributesPageLayout {...defaultProps} />);

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
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

    const dialog = await screen.findByRole('dialog');
    const confirmButton = within(dialog).getByRole('button', {
      name: 'Save changes',
    });
    await user.click(confirmButton);

    await waitFor(
      () => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
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

  it('shows a new merge group in the review changes modal', async () => {
    const user = userEvent.setup();

    renderWithProviders(<GlobalFacetAttributesPageLayout {...defaultProps} />);

    await user.click(screen.getByLabelText('Select 13 - 14.4 to merge'));
    await user.click(screen.getByLabelText('Select 10 - 12.9 to merge'));

    const mergeButton = screen.getByRole('button', { name: 'Merge' });
    await waitFor(() => {
      expect(mergeButton).toBeEnabled();
    });
    await user.click(mergeButton);

    await waitFor(() => {
      expect(screen.getByText('Edit merge')).toBeInTheDocument();
    });

    const mergeNameInput = screen.getByDisplayValue('13 - 14.4');
    await user.clear(mergeNameInput);
    await user.type(mergeNameInput, 'Combined Sizes');

    const editMergeDialog = screen.getByRole('dialog', {
      name: 'Edit facet attribute values modal',
    });
    await user.click(
      within(editMergeDialog).getByRole('button', { name: 'Save' })
    );

    await waitFor(() => {
      expect(screen.queryByText('Edit merge')).not.toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    const dialog = await screen.findByRole('dialog');
    expect(
      within(dialog).getByText(
        'Combined Sizes: 13 - 14.4, 10 - 12.9 (Algo control)'
      )
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

    const dialog = await screen.findByRole('dialog');
    const confirmButton = within(dialog).getByRole('button', {
      name: 'Save changes',
    });
    await user.click(confirmButton);

    expect(mockUpdateGlobalFacet).toHaveBeenCalledWith({
      facetId: 'color',
      data: {
        ...defaultProps.facet,
        merged: mergeGroup,
        excludedValues: ['Ducky Downy'],
        boosted: ['Cotton', 'Duck Down'],
      },
      shouldUseV1: false,
    });

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith(`/global/facet-config`);
    });
  });

  it('sends the v1 flag + version and shows the conflict modal on a 409', async () => {
    const user = userEvent.setup();
    mockUpdateGlobalFacet.mockResolvedValueOnce({
      status: 'conflict',
      currentEntity: {
        ...defaultProps.facet,
        excludedValues: [
          ...(defaultProps.facet.excludedValues ?? []),
          '13 - 14.4',
        ],
        version: 4,
        lastChanged: { date: '2024-02-02T00:00:00Z', user: 'Other User' },
      },
    });

    renderWithProviders(
      <GlobalFacetAttributesPageLayout
        {...defaultProps}
        facet={{ ...defaultProps.facet, version: 2 }}
      />,
      undefined,
      { featureFlags: { hasOptimisticLocking: true } }
    );

    await user.click(screen.getByRole('button', { name: 'Save' }));
    const reviewDialog = await screen.findByRole('dialog');
    await user.click(
      within(reviewDialog).getByRole('button', { name: 'Save changes' })
    );

    expect(mockUpdateGlobalFacet).toHaveBeenCalledWith(
      expect.objectContaining({ shouldUseV1: true, version: 2 })
    );
    const conflictDialog = await screen.findByRole('dialog', {
      name: 'This facet was changed by someone else',
    });
    expect(conflictDialog).toBeInTheDocument();
    expect(
      within(conflictDialog).getByText(
        '13 - 14.4 (Algo control → Exclude only)'
      )
    ).toBeInTheDocument();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  describe('sticky bar pin button', () => {
    it('shows pin button', () => {
      renderWithProviders(
        <GlobalFacetAttributesPageLayout {...defaultProps} />
      );
      expect(
        screen.getByRole('button', { name: 'Pin top bar' })
      ).toBeInTheDocument();
    });

    it('toggles pin state when pin button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <GlobalFacetAttributesPageLayout {...defaultProps} />
      );

      const pinButton = screen.getByRole('button', { name: 'Pin top bar' });
      expect(pinButton).toHaveAttribute('aria-pressed', 'false');

      await user.click(pinButton);

      expect(
        screen.getByRole('button', { name: 'Unpin top bar' })
      ).toHaveAttribute('aria-pressed', 'true');
    });
  });
});
