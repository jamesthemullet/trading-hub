import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type {
  MerchandisingAttributeValuesResponse,
  MerchandisingCountryCode,
  MerchandisingReturnedGlobalFacet,
} from '@/libs/api';
import {
  useCheckMergeNameUnique,
  useGetFacetAttributeValues,
  useGlobalFacetUpdate,
} from '@/libs/hooks';
import { renderWithProviders } from '@/test/render-with-providers';

import {
  GlobalFacetPanelModal,
  GlobalFacetPanelModalContent,
} from './global-facets-panel-modal';

const mockUpdateGlobalFacet = jest.fn(() =>
  Promise.resolve({} as MerchandisingReturnedGlobalFacet | { status: string })
);
const updateGlobalFacet = {
  handleGlobalFacetUpdate: mockUpdateGlobalFacet,
  error: '',
};
jest.mock('@/libs/hooks/use-get-facet-attribute-values', () => ({
  ...jest.requireActual('@/libs/hooks/use-get-facet-attribute-values'),
  useGetFacetAttributeValues: jest.fn(),
}));
jest.mock('@/libs/hooks/global/facets/use-global-facet-update', () => ({
  ...jest.requireActual('@/libs/hooks/global/facets/use-global-facet-update'),
  useGlobalFacetUpdate: jest.fn(),
}));
jest.mock('@/libs/hooks/use-check-merge-name-unique', () => ({
  ...jest.requireActual('@/libs/hooks/use-check-merge-name-unique'),
  useCheckMergeNameUnique: jest.fn(),
}));

const mockFacet: MerchandisingReturnedGlobalFacet = {
  id: '4f8d4800-3eb0-11ef-9a6a-000000000000',
  indexPropertyName: 'alcoholContent',
  displayValue: 'Alcohol Percentage',
  lastChanged: {
    date: '2024-11-20T11:48:57Z',
    user: 'John Smith',
  },
  excludedValues: ['Over 20', '13 - 14.4'],
  boosted: ['10 - 12.9', 'Under 10', '14.5 - 20'],
  merged: [
    {
      displayValue: 'Under 13',
      mergedValues: ['10 - 12.9', 'Under 10'],
    },
  ],
};

const attributeValuesMock: MerchandisingAttributeValuesResponse['values'] = [
  {
    displayValue: '13 - 14.4',
  },
  {
    displayValue: '10 - 12.9',
  },
  {
    displayValue: '14.5 - 20',
  },
  {
    displayValue: 'Under 10',
  },
  {
    displayValue: 'Over 20',
  },
];

const defaultProps = {
  writeEnabled: true,
  countryCode: 'UK' as MerchandisingCountryCode,
};

describe('GlobalFacetPanelModal', () => {
  beforeEach(() => {
    jest.mocked(useGetFacetAttributeValues).mockReturnValue({
      attributeValues: attributeValuesMock,
      error: '',
      isLoading: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render a loader', async () => {
    renderWithProviders(
      <GlobalFacetPanelModal
        facet={mockFacet}
        {...defaultProps}
        onClose={jest.fn()}
      />
    );

    expect(
      screen.getByText('Facet value settings of: Alcohol Percentage')
    ).toBeVisible();

    expect(screen.getByTestId('loader')).toBeVisible();
  });

  it('should render an error', async () => {
    jest.mocked(useGetFacetAttributeValues).mockReturnValue({
      attributeValues: attributeValuesMock,
      error: 'failed to fetch',
      isLoading: false,
    });

    renderWithProviders(
      <GlobalFacetPanelModal
        facet={mockFacet}
        {...defaultProps}
        onClose={jest.fn()}
      />
    );

    expect(
      screen.getByText('Error retrieving values: failed to fetch')
    ).toBeVisible();
  });

  it('should close', async () => {
    const mockClose = jest.fn();

    renderWithProviders(
      <GlobalFacetPanelModal
        facet={mockFacet}
        {...defaultProps}
        onClose={mockClose}
      />
    );

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    cancelButton.click();

    expect(mockClose).toHaveBeenCalled();
  });
});

describe('GlobalFacetPanelModalContent', () => {
  beforeEach(() => {
    jest.mocked(useGlobalFacetUpdate).mockReturnValue(updateGlobalFacet);

    jest.mocked(useCheckMergeNameUnique).mockReturnValue({
      checkMergeNameUnique: () =>
        Promise.resolve({
          isUniqueValue: true,
        }),
      error: '',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should save', async () => {
    const mockOnClose = jest.fn();
    mockUpdateGlobalFacet.mockResolvedValueOnce(mockFacet);

    renderWithProviders(
      <GlobalFacetPanelModalContent
        attributeValues={attributeValuesMock}
        facet={mockFacet}
        {...defaultProps}
        onClose={mockOnClose}
      />
    );

    const saveButton = screen.getByRole('button', { name: 'Save' });

    act(() => {
      saveButton.click();
    });

    await waitFor(async () => {
      expect(
        await screen.findByRole('heading', { name: 'Apply global changes' })
      ).toBeVisible();
    });

    const confirmButton = screen.getByRole('button', {
      name: 'Apply action',
    });

    act(() => {
      confirmButton.click();
    });

    await waitFor(() => expect(mockOnClose).toHaveBeenCalled());
    expect(mockUpdateGlobalFacet).toHaveBeenCalled();
  });

  it('should close the confirmation modal when cancel button on modal clicked', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <GlobalFacetPanelModalContent
        attributeValues={attributeValuesMock}
        facet={mockFacet}
        {...defaultProps}
        onClose={jest.fn()}
      />
    );

    const saveButton = screen.getByRole('button', { name: 'Save' });

    act(() => {
      saveButton.click();
    });

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: 'Apply global changes',
        })
      ).toBeVisible();
    });

    await user.click(
      screen.getByRole('button', { name: 'Close confirmation modal' })
    );

    expect(mockUpdateGlobalFacet).not.toHaveBeenCalled();
  });

  it('should not close on save error', async () => {
    mockUpdateGlobalFacet.mockResolvedValueOnce({ status: 'error' });
    const mockOnClose = jest.fn();

    renderWithProviders(
      <GlobalFacetPanelModalContent
        attributeValues={attributeValuesMock}
        facet={mockFacet}
        {...defaultProps}
        onClose={mockOnClose}
      />
    );

    const saveButton = screen.getByRole('button', { name: 'Save' });
    act(() => {
      saveButton.click();
    });

    await waitFor(async () => {
      expect(
        await screen.findByRole('heading', { name: 'Apply global changes' })
      ).toBeVisible();
    });

    const confirmButton = screen.getByRole('button', {
      name: 'Apply action',
    });

    act(() => {
      confirmButton.click();
    });

    expect(mockUpdateGlobalFacet).toHaveBeenCalledWith({
      data: mockFacet,
      facetId: mockFacet.id,
    });

    await waitFor(() => expect(mockOnClose).not.toHaveBeenCalled());
  });

  it('should set boosted, excluded and merged defaults', () => {
    const mockOnClose = jest.fn();
    mockUpdateGlobalFacet.mockResolvedValueOnce(mockFacet);

    renderWithProviders(
      <GlobalFacetPanelModalContent
        attributeValues={[attributeValuesMock[0]]}
        facet={{
          id: mockFacet.id,
          indexPropertyName: mockFacet.indexPropertyName,
          displayValue: mockFacet.displayValue,
          lastChanged: mockFacet.lastChanged,
        }}
        {...defaultProps}
        onClose={mockOnClose}
        writeEnabled={true}
      />
    );

    expect(screen.getByRole('button', { name: 'Algo control' })).toBeVisible();
  });

  describe('Attribute value rows', () => {
    it('should show boosted, excluded algo control rows', () => {
      const mockOnClose = jest.fn();
      mockUpdateGlobalFacet.mockResolvedValueOnce(mockFacet);

      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={[
            attributeValuesMock[0],
            attributeValuesMock[1],
            attributeValuesMock[2],
          ]}
          facet={{
            id: mockFacet.id,
            indexPropertyName: mockFacet.indexPropertyName,
            displayValue: mockFacet.displayValue,
            lastChanged: mockFacet.lastChanged,
            boosted: [attributeValuesMock[0].displayValue],
            excludedValues: [attributeValuesMock[2].displayValue],
          }}
          {...defaultProps}
          onClose={mockOnClose}
          writeEnabled={true}
        />
      );

      expect(
        screen.getByRole('button', { name: 'Include only' })
      ).toBeVisible();
      expect(
        screen.getByRole('button', { name: 'Algo control' })
      ).toBeVisible();
      expect(
        screen.getByRole('button', { name: 'Exclude only' })
      ).toBeVisible();
    });

    it('should show merged values', () => {
      const mockOnClose = jest.fn();
      mockUpdateGlobalFacet.mockResolvedValueOnce(mockFacet);

      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={[
            attributeValuesMock[0],
            attributeValuesMock[1],
            attributeValuesMock[2],
          ]}
          facet={{
            id: mockFacet.id,
            indexPropertyName: mockFacet.indexPropertyName,
            displayValue: mockFacet.displayValue,
            lastChanged: mockFacet.lastChanged,
            merged: [
              {
                displayValue: 'Foo',
                mergedValues: [
                  attributeValuesMock[0].displayValue,
                  attributeValuesMock[1].displayValue,
                  attributeValuesMock[2].displayValue,
                ],
              },
            ],
          }}
          {...defaultProps}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Merged Value Group')).toBeVisible();

      expect(screen.getByText('Foo')).toBeVisible();
    });

    it('should filter values', async () => {
      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={attributeValuesMock}
          facet={{ ...mockFacet, merged: [] }}
          {...defaultProps}
          onClose={jest.fn()}
        />
      );
      const under10label = screen.getByTestId('Label for Under 10');
      const over20label = screen.getByTestId('Label for Over 20');
      expect(under10label).toBeVisible();
      expect(over20label).toBeVisible();

      const searchInput = await screen.findByPlaceholderText('Search...');

      await userEvent.type(searchInput, 'over');

      await waitFor(() => {
        expect(under10label).not.toBeVisible();
      });

      expect(over20label).toBeVisible();
    });

    it('should rename a row', async () => {
      const newRowName = 'New row name';

      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={attributeValuesMock}
          facet={{ ...mockFacet, merged: [], boosted: [], excludedValues: [] }}
          {...defaultProps}
          onClose={jest.fn()}
        />
      );

      const editButton = await screen.findByLabelText(
        `Edit display name for ${attributeValuesMock[0].displayValue}`
      );

      act(() => {
        editButton.click();
      });

      const inputField = await screen.findByLabelText(
        `Edit ${attributeValuesMock[0].displayValue} input field`
      );

      expect(inputField).toHaveValue(attributeValuesMock[0].displayValue);

      await waitFor(async () => {
        await userEvent.clear(inputField);
        await userEvent.type(inputField, newRowName);
        await userEvent.keyboard('{enter}');
      });

      await waitFor(() => {
        const updatedRow = screen.getByTestId(`Label for ${newRowName}`);
        expect(updatedRow).toBeVisible();
      });
    }, 1000);

    it('should allow renaming to the same name', async () => {
      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={attributeValuesMock}
          facet={{ ...mockFacet, merged: [], boosted: [], excludedValues: [] }}
          {...defaultProps}
          onClose={jest.fn()}
        />
      );

      const editButton = await screen.findByLabelText(
        `Edit display name for ${attributeValuesMock[0].displayValue}`
      );

      act(() => {
        editButton.click();
      });

      const inputField = await screen.findByLabelText(
        `Edit ${attributeValuesMock[0].displayValue} input field`
      );

      expect(inputField).toHaveValue(attributeValuesMock[0].displayValue);

      await waitFor(async () => {
        await userEvent.clear(inputField);
        await userEvent.type(inputField, attributeValuesMock[0].displayValue);
        await userEvent.keyboard('{enter}');
      });

      await waitFor(() => {
        const updatedRow = screen.getByTestId(
          `Label for ${attributeValuesMock[0].displayValue}`
        );
        expect(updatedRow).toBeVisible();
      });
    });

    it('should not allow renaming a row to an existing value', async () => {
      jest.mocked(useCheckMergeNameUnique).mockReturnValue({
        checkMergeNameUnique: jest.fn().mockResolvedValue({
          isUniqueValue: false,
        }),
        error: '',
      });

      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={attributeValuesMock}
          facet={{ ...mockFacet, merged: [], boosted: [], excludedValues: [] }}
          {...defaultProps}
          onClose={jest.fn()}
        />
      );

      const editButton = await screen.findByLabelText(
        `Edit display name for ${attributeValuesMock[0].displayValue}`
      );

      act(() => {
        editButton.click();
      });

      const inputField = await screen.findByLabelText(
        `Edit ${attributeValuesMock[0].displayValue} input field`
      );

      expect(inputField).toHaveValue(attributeValuesMock[0].displayValue);

      await waitFor(async () => {
        await userEvent.clear(inputField);
        await userEvent.type(inputField, attributeValuesMock[1].displayValue);
        await userEvent.keyboard('{enter}');
      });

      const errorMessage = screen.getByText(
        `${attributeValuesMock[1].displayValue} is not a unique value`
      );
      expect(errorMessage).toBeVisible();

      const cancelButton = screen.getByLabelText(
        `Cancel ${attributeValuesMock[0].displayValue} change`
      );
      act(() => {
        cancelButton.click();
      });
      expect(errorMessage).not.toBeVisible();
    });

    it('should open actions dropdown and make no changes if algo control is chosen', async () => {
      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={[attributeValuesMock[0]]}
          facet={{ ...mockFacet, merged: [], boosted: [], excludedValues: [] }}
          {...defaultProps}
          onClose={jest.fn()}
        />
      );

      expect(
        screen.getByTestId(
          `button to open facet order dropdown for ${attributeValuesMock[0].displayValue}`
        )
      ).toHaveTextContent('Algo control');

      const select = await screen.findByTestId(
        `button to open facet order dropdown for ${attributeValuesMock[0].displayValue}`
      );

      await userEvent.click(select);

      const algoControlButton = screen.getByLabelText(
        `algoControl ${attributeValuesMock[0].displayValue}`
      );

      await userEvent.click(algoControlButton);

      expect(
        screen.getByTestId(
          `button to open facet order dropdown for ${attributeValuesMock[0].displayValue}`
        )
      ).toHaveTextContent('Algo control');
    });

    it('should open actions dropdown and select include only', async () => {
      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={[attributeValuesMock[0]]}
          facet={{
            ...mockFacet,
            merged: [],
            boosted: [],
            excludedValues: ['test attribute'],
          }}
          {...defaultProps}
          onClose={jest.fn()}
        />
      );

      expect(
        screen.getByTestId(
          `button to open facet order dropdown for ${attributeValuesMock[0].displayValue}`
        )
      ).toHaveTextContent('Algo control');

      const select = await screen.findByTestId(
        `button to open facet order dropdown for ${attributeValuesMock[0].displayValue}`
      );

      await userEvent.click(select);

      const button = screen.getByLabelText(
        `include ${attributeValuesMock[0].displayValue}`
      );

      await userEvent.click(button);

      expect(
        screen.getByTestId(
          `button to open facet order dropdown for ${attributeValuesMock[0].displayValue}`
        )
      ).toHaveTextContent('Include only');
    });

    it('should open actions dropdown and select exclude only', async () => {
      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={[attributeValuesMock[0]]}
          facet={{ ...mockFacet, merged: [], boosted: [], excludedValues: [] }}
          {...defaultProps}
          onClose={jest.fn()}
        />
      );

      expect(
        screen.getByTestId(
          `button to open facet order dropdown for ${attributeValuesMock[0].displayValue}`
        )
      ).toHaveTextContent('Algo control');

      const select = await screen.findByTestId(
        `button to open facet order dropdown for ${attributeValuesMock[0].displayValue}`
      );

      await userEvent.click(select);

      const button = screen.getByLabelText(
        `exclude ${attributeValuesMock[0].displayValue}`
      );

      await userEvent.click(button);

      expect(
        screen.getByTestId(
          `button to open facet order dropdown for ${attributeValuesMock[0].displayValue}`
        )
      ).toHaveTextContent('Exclude only');
    });

    it('should open actions dropdown and change excluded facet to include only', async () => {
      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={[attributeValuesMock[0]]}
          facet={{
            ...mockFacet,
            merged: [],
            boosted: [],
            excludedValues: [attributeValuesMock[0].displayValue],
          }}
          {...defaultProps}
          onClose={jest.fn()}
        />
      );

      expect(
        screen.getByTestId(
          `button to open facet order dropdown for ${attributeValuesMock[0].displayValue}`
        )
      ).toHaveTextContent('Exclude only');

      const select = await screen.findByTestId(
        `button to open facet order dropdown for ${attributeValuesMock[0].displayValue}`
      );

      await userEvent.click(select);

      const includeButton = screen.getByLabelText(
        `include ${attributeValuesMock[0].displayValue}`
      );

      await userEvent.click(includeButton);

      expect(
        screen.getByTestId(
          `button to open facet order dropdown for ${attributeValuesMock[0].displayValue}`
        )
      ).toHaveTextContent('Include only');
    });

    it('should open actions dropdown and change included facet to exclude only', async () => {
      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={[attributeValuesMock[0]]}
          facet={{
            ...mockFacet,
            merged: [],
            boosted: [attributeValuesMock[0].displayValue],
            excludedValues: [],
          }}
          {...defaultProps}
          onClose={jest.fn()}
        />
      );

      expect(
        screen.getByTestId(
          `button to open facet order dropdown for ${attributeValuesMock[0].displayValue}`
        )
      ).toHaveTextContent('Include only');

      const select = await screen.findByTestId(
        `button to open facet order dropdown for ${attributeValuesMock[0].displayValue}`
      );

      await userEvent.click(select);

      const excludeButton = screen.getByLabelText(
        `exclude ${attributeValuesMock[0].displayValue}`
      );

      await userEvent.click(excludeButton);

      expect(
        screen.getByTestId(
          `button to open facet order dropdown for ${attributeValuesMock[0].displayValue}`
        )
      ).toHaveTextContent('Exclude only');
    });

    it('should open actions dropdown and change excluded facet to algo control', async () => {
      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={[attributeValuesMock[0]]}
          facet={{
            ...mockFacet,
            merged: [],
            boosted: [],
            excludedValues: [attributeValuesMock[0].displayValue],
          }}
          {...defaultProps}
          onClose={jest.fn()}
        />
      );

      expect(
        screen.getByTestId(
          `button to open facet order dropdown for ${attributeValuesMock[0].displayValue}`
        )
      ).toHaveTextContent('Exclude only');

      const select = await screen.findByTestId(
        `button to open facet order dropdown for ${attributeValuesMock[0].displayValue}`
      );

      await userEvent.click(select);

      const algoControlButton = screen.getByLabelText(
        `algoControl ${attributeValuesMock[0].displayValue}`
      );

      await userEvent.click(algoControlButton);

      expect(
        screen.getByTestId(
          `button to open facet order dropdown for ${attributeValuesMock[0].displayValue}`
        )
      ).toHaveTextContent('Algo control');
    });

    it('should open actions dropdown and change included facet to algo control', async () => {
      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={[attributeValuesMock[0]]}
          facet={{
            ...mockFacet,
            merged: [],
            boosted: [attributeValuesMock[0].displayValue],
            excludedValues: [],
          }}
          {...defaultProps}
          onClose={jest.fn()}
        />
      );

      expect(
        screen.getByTestId(
          `button to open facet order dropdown for ${attributeValuesMock[0].displayValue}`
        )
      ).toHaveTextContent('Include only');

      const select = await screen.findByTestId(
        `button to open facet order dropdown for ${attributeValuesMock[0].displayValue}`
      );

      await userEvent.click(select);

      const algoControlButton = screen.getByLabelText(
        `algoControl ${attributeValuesMock[0].displayValue}`
      );

      await userEvent.click(algoControlButton);

      expect(
        screen.getByTestId(
          `button to open facet order dropdown for ${attributeValuesMock[0].displayValue}`
        )
      ).toHaveTextContent('Algo control');
    });
  });

  describe('row ordering', () => {
    it('should move a row up', () => {
      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={[attributeValuesMock[0], attributeValuesMock[1]]}
          facet={{
            ...mockFacet,
            merged: [],
            boosted: [
              attributeValuesMock[0].displayValue,
              attributeValuesMock[1].displayValue,
            ],
            excludedValues: [],
          }}
          {...defaultProps}
          onClose={jest.fn()}
        />
      );

      expect(
        screen.getByTestId(
          `included attribute 0 ${attributeValuesMock[0].displayValue}`
        )
      ).toBeVisible();
      expect(
        screen.getByTestId(
          `included attribute 1 ${attributeValuesMock[1].displayValue}`
        )
      ).toBeVisible();

      const button = screen.getByLabelText(
        `Move ${attributeValuesMock[1].displayValue} row up`
      );

      act(() => {
        button.click();
      });

      expect(
        screen.getByTestId(
          `included attribute 0 ${attributeValuesMock[1].displayValue}`
        )
      ).toBeVisible();
      expect(
        screen.getByTestId(
          `included attribute 1 ${attributeValuesMock[0].displayValue}`
        )
      ).toBeVisible();
    });

    it('should move a row down', () => {
      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={[attributeValuesMock[0], attributeValuesMock[1]]}
          facet={{
            ...mockFacet,
            merged: [],
            boosted: [
              attributeValuesMock[0].displayValue,
              attributeValuesMock[1].displayValue,
            ],
            excludedValues: [],
          }}
          {...defaultProps}
          onClose={jest.fn()}
        />
      );

      expect(
        screen.getByTestId(
          `included attribute 0 ${attributeValuesMock[0].displayValue}`
        )
      ).toBeVisible();
      expect(
        screen.getByTestId(
          `included attribute 1 ${attributeValuesMock[1].displayValue}`
        )
      ).toBeVisible();

      const button = screen.getByLabelText(
        `Move ${attributeValuesMock[0].displayValue} row down`
      );

      act(() => {
        button.click();
      });

      expect(
        screen.getByTestId(
          `included attribute 0 ${attributeValuesMock[1].displayValue}`
        )
      ).toBeVisible();
      expect(
        screen.getByTestId(
          `included attribute 1 ${attributeValuesMock[0].displayValue}`
        )
      ).toBeVisible();
    });

    it('should move a row above a merged row', () => {
      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={[
            attributeValuesMock[0],
            attributeValuesMock[1],
            attributeValuesMock[2],
            attributeValuesMock[3],
          ]}
          facet={{
            ...mockFacet,
            merged: [
              {
                displayValue: 'foo',
                mergedValues: [
                  attributeValuesMock[1].displayValue,
                  attributeValuesMock[2].displayValue,
                ],
              },
            ],
            boosted: [
              attributeValuesMock[0].displayValue,
              attributeValuesMock[1].displayValue,
              attributeValuesMock[2].displayValue,
              attributeValuesMock[3].displayValue,
            ],
            excludedValues: [],
          }}
          {...defaultProps}
          onClose={jest.fn()}
        />
      );

      expect(
        screen.getByTestId(
          `included attribute 2 ${attributeValuesMock[3].displayValue}`
        )
      ).toBeVisible();

      const button = screen.getByLabelText(
        `Move ${attributeValuesMock[3].displayValue} row up`
      );

      act(() => {
        button.click();
      });

      expect(
        screen.getByTestId(
          `included attribute 1 ${attributeValuesMock[3].displayValue}`
        )
      ).toBeVisible();
    });

    it('should move a row below a merged row', () => {
      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={attributeValuesMock}
          facet={{
            ...mockFacet,
            merged: [
              {
                displayValue: 'foo',
                mergedValues: [
                  attributeValuesMock[1].displayValue,
                  attributeValuesMock[2].displayValue,
                ],
              },
            ],
            boosted: [
              attributeValuesMock[0].displayValue,
              attributeValuesMock[1].displayValue,
              attributeValuesMock[2].displayValue,
              attributeValuesMock[3].displayValue,
            ],
            excludedValues: [],
          }}
          {...defaultProps}
          onClose={jest.fn()}
        />
      );

      expect(
        screen.getByTestId(
          `included attribute 0 ${attributeValuesMock[0].displayValue}`
        )
      ).toBeVisible();

      const button = screen.getByLabelText(
        `Move ${attributeValuesMock[0].displayValue} row down`
      );

      act(() => {
        button.click();
      });

      expect(
        screen.getByTestId(
          `included attribute 1 ${attributeValuesMock[0].displayValue}`
        )
      ).toBeVisible();
    });
  });

  describe('merging values', () => {
    it('should merge 2 values', async () => {
      const newMergeName = 'New Merge Name';

      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={attributeValuesMock}
          facet={{
            ...mockFacet,
            merged: [
              {
                displayValue: 'Foo',
                mergedValues: [
                  attributeValuesMock[2].displayValue,
                  attributeValuesMock[3].displayValue,
                ],
              },
            ],
            boosted: [],
            excludedValues: [],
          }}
          {...defaultProps}
          onClose={jest.fn()}
        />
      );

      const checkbox1 = screen.getByLabelText(
        `Select ${attributeValuesMock[0].displayValue} to merge`
      );

      act(() => {
        checkbox1.click();
      });

      expect(screen.getByRole('button', { name: 'Merge (1)' })).toBeVisible();

      const checkbox2 = screen.getByLabelText(
        `Select ${attributeValuesMock[1].displayValue} to merge`
      );

      act(() => {
        checkbox2.click();
      });

      const mergeButton = screen.getByRole('button', { name: 'Merge (2)' });

      act(() => {
        mergeButton.click();
      });

      const inputField = await screen.findByLabelText(
        `Edit ${attributeValuesMock[0].displayValue} input field`
      );

      await waitFor(async () => {
        await userEvent.clear(inputField);
        await userEvent.type(inputField, newMergeName);
        await userEvent.keyboard('{enter}');
      });
      await waitFor(() => {
        const updatedRow = screen.getByTestId(`Label for ${newMergeName}`);
        expect(updatedRow).toBeVisible();
      });
    });

    it('should merge all values', async () => {
      const newMergeName = 'New Merge Name';

      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={attributeValuesMock}
          facet={{ ...mockFacet, merged: [], boosted: [], excludedValues: [] }}
          {...defaultProps}
          onClose={jest.fn()}
        />
      );

      const button = screen.getByLabelText('Select all facet attributes');

      act(() => {
        button.click();
      });

      const mergeButton = screen.getByRole('button', { name: 'Merge (5)' });

      act(() => {
        mergeButton.click();
      });

      const inputField = await screen.findByLabelText(
        `Edit ${attributeValuesMock[0].displayValue} input field`
      );

      await waitFor(async () => {
        await userEvent.clear(inputField);
        await userEvent.type(inputField, newMergeName);
        await userEvent.keyboard('{enter}');
      });
      await waitFor(() => {
        const updatedRow = screen.getByTestId(`Label for ${newMergeName}`);
        expect(updatedRow).toBeVisible();
      });
    });

    it('should deselect a single value', async () => {
      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={[attributeValuesMock[0], attributeValuesMock[1]]}
          facet={{ ...mockFacet, merged: [], boosted: [], excludedValues: [] }}
          {...defaultProps}
          onClose={jest.fn()}
        />
      );

      const button = screen.getByLabelText('Select all facet attributes');

      act(() => {
        button.click();
      });

      expect(screen.getByRole('button', { name: 'Merge (2)' })).toBeVisible();

      const checkbox1 = screen.getByLabelText(
        `Select ${attributeValuesMock[0].displayValue} to merge`
      );

      act(() => {
        checkbox1.click();
      });

      expect(screen.getByRole('button', { name: 'Merge (1)' })).toBeVisible();
    });

    it('should deselect all values', async () => {
      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={[attributeValuesMock[0], attributeValuesMock[1]]}
          facet={{ ...mockFacet, merged: [], boosted: [], excludedValues: [] }}
          {...defaultProps}
          onClose={jest.fn()}
        />
      );

      const button = screen.getByLabelText('Select all facet attributes');

      act(() => {
        button.click();
      });

      expect(screen.getByRole('button', { name: 'Merge (2)' })).toBeVisible();

      act(() => {
        button.click();
      });

      expect(screen.getByRole('button', { name: 'Merge (0)' })).toBeVisible();
    });

    it('should merge into an existing merge group', async () => {
      const mergeName = 'Foo';
      const newMergeName = 'New Merge Name';

      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={attributeValuesMock}
          facet={{
            ...mockFacet,
            merged: [
              {
                displayValue: mergeName,
                mergedValues: [
                  attributeValuesMock[2].displayValue,
                  attributeValuesMock[3].displayValue,
                ],
              },
            ],
            boosted: [],
            excludedValues: [],
          }}
          {...defaultProps}
          onClose={jest.fn()}
        />
      );

      const checkbox1 = screen.getByLabelText(
        `Select ${attributeValuesMock[0].displayValue} to merge`
      );

      act(() => {
        checkbox1.click();
      });

      expect(screen.getByRole('button', { name: 'Merge (1)' })).toBeVisible();

      const checkbox2 = screen.getByLabelText(`Select ${mergeName} to merge`);

      act(() => {
        checkbox2.click();
      });

      const mergeButton = screen.getByRole('button', { name: 'Merge (3)' });

      act(() => {
        mergeButton.click();
      });

      const inputField = await screen.findByLabelText(
        `Edit ${attributeValuesMock[0].displayValue} input field`
      );

      await waitFor(async () => {
        await userEvent.clear(inputField);
        await userEvent.type(inputField, newMergeName);
        await userEvent.keyboard('{enter}');
      });
      await waitFor(() => {
        const updatedRow = screen.getByTestId(`Label for ${newMergeName}`);
        expect(updatedRow).toBeVisible();
      });
    });

    it('should merge into a boosted merge group if the first selected value is boosted', async () => {
      const newMergeName = 'New Merge Name';

      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={attributeValuesMock}
          facet={{
            ...mockFacet,
            merged: [],
            boosted: [attributeValuesMock[0].displayValue],
            excludedValues: [],
          }}
          {...defaultProps}
          onClose={jest.fn()}
        />
      );

      const checkbox1 = screen.getByLabelText(
        `Select ${attributeValuesMock[0].displayValue} to merge`
      );

      act(() => {
        checkbox1.click();
      });

      expect(screen.getByRole('button', { name: 'Merge (1)' })).toBeVisible();

      const checkbox2 = screen.getByLabelText(
        `Select ${attributeValuesMock[1].displayValue} to merge`
      );

      act(() => {
        checkbox2.click();
      });

      const mergeButton = screen.getByRole('button', { name: 'Merge (2)' });

      act(() => {
        mergeButton.click();
      });

      const inputField = await screen.findByLabelText(
        `Edit ${attributeValuesMock[0].displayValue} input field`
      );

      await waitFor(async () => {
        await userEvent.clear(inputField);
        await userEvent.type(inputField, newMergeName);
        await userEvent.keyboard('{enter}');
      });
      await waitFor(() => {
        const updatedRow = screen.getByTestId(`Label for ${newMergeName}`);
        expect(updatedRow).toBeVisible();
      });
    });

    it('should merge into an excluded merge group if the first selected value is excluded', async () => {
      const newMergeName = 'New Merge Name';

      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={attributeValuesMock}
          facet={{
            ...mockFacet,
            merged: [],
            boosted: [],
            excludedValues: [attributeValuesMock[0].displayValue],
          }}
          {...defaultProps}
          onClose={jest.fn()}
        />
      );

      const checkbox1 = screen.getByLabelText(
        `Select ${attributeValuesMock[0].displayValue} to merge`
      );

      act(() => {
        checkbox1.click();
      });

      expect(screen.getByRole('button', { name: 'Merge (1)' })).toBeVisible();

      const checkbox2 = screen.getByLabelText(
        `Select ${attributeValuesMock[1].displayValue} to merge`
      );

      act(() => {
        checkbox2.click();
      });

      const mergeButton = screen.getByRole('button', { name: 'Merge (2)' });

      act(() => {
        mergeButton.click();
      });

      const inputField = screen.getByRole('textbox', {
        name: `Edit ${attributeValuesMock[0].displayValue} input field`,
      });

      await waitFor(async () => {
        await userEvent.clear(inputField);
        await userEvent.type(inputField, newMergeName);
        await userEvent.keyboard('{enter}');
      });
      await waitFor(() => {
        const updatedRow = screen.getByTestId(`Label for ${newMergeName}`);
        expect(updatedRow).toBeVisible();
      });
    });

    it('should allow renaming the merge group to a merged attribute', async () => {
      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={attributeValuesMock}
          facet={{ ...mockFacet, merged: [], boosted: [], excludedValues: [] }}
          {...defaultProps}
          onClose={jest.fn()}
        />
      );

      const checkbox1 = screen.getByLabelText(
        `Select ${attributeValuesMock[0].displayValue} to merge`
      );

      act(() => {
        checkbox1.click();
      });

      expect(screen.getByRole('button', { name: 'Merge (1)' })).toBeVisible();

      const checkbox2 = screen.getByLabelText(
        `Select ${attributeValuesMock[1].displayValue} to merge`
      );

      act(() => {
        checkbox2.click();
      });

      const mergeButton = screen.getByRole('button', { name: 'Merge (2)' });

      act(() => {
        mergeButton.click();
      });

      const inputField = await screen.findByLabelText(
        `Edit ${attributeValuesMock[0].displayValue} input field`
      );

      await waitFor(async () => {
        await userEvent.clear(inputField);
        await userEvent.type(inputField, attributeValuesMock[1].displayValue);
        await userEvent.keyboard('{enter}');
      });
      await waitFor(() => {
        const updatedRow = screen.getByTestId(
          `Label for ${attributeValuesMock[1].displayValue}`
        );
        expect(updatedRow).toBeVisible();
      });
    });

    it('should not allow naming the merge group to the same name of a merged attribute in another merge group regardless of case', async () => {
      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={attributeValuesMock}
          facet={{
            ...mockFacet,
            merged: [
              { displayValue: 'Also merged', mergedValues: ['Foo', 'Bar'] },
            ],
            boosted: [],
            excludedValues: [],
          }}
          {...defaultProps}
          onClose={jest.fn()}
        />
      );

      const checkbox1 = screen.getByLabelText(
        `Select ${attributeValuesMock[0].displayValue} to merge`
      );

      act(() => {
        checkbox1.click();
      });

      expect(screen.getByRole('button', { name: 'Merge (1)' })).toBeVisible();

      const checkbox2 = screen.getByLabelText(
        `Select ${attributeValuesMock[1].displayValue} to merge`
      );

      act(() => {
        checkbox2.click();
      });

      const mergeButton = screen.getByRole('button', { name: 'Merge (2)' });

      act(() => {
        mergeButton.click();
      });

      const inputField = await screen.findByLabelText(
        `Edit ${attributeValuesMock[0].displayValue} input field`
      );

      await waitFor(async () => {
        await userEvent.clear(inputField);
        await userEvent.type(inputField, 'FOO');
        await userEvent.keyboard('{enter}');
      });

      const errorMessage = screen.getByText('FOO is not a unique value');
      expect(errorMessage).toBeVisible();
    });

    it('should remove a value from a merge group', async () => {
      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={attributeValuesMock}
          facet={{
            ...mockFacet,
            merged: [
              {
                displayValue: 'Foo',
                mergedValues: [
                  attributeValuesMock[0].displayValue,
                  attributeValuesMock[1].displayValue,
                  attributeValuesMock[2].displayValue,
                ],
              },
              {
                displayValue: 'Bar',
                mergedValues: [
                  attributeValuesMock[3].displayValue,
                  attributeValuesMock[4].displayValue,
                ],
              },
            ],
            boosted: [],
            excludedValues: [],
          }}
          {...defaultProps}
          onClose={jest.fn()}
        />
      );

      expect(screen.getByTestId('algoControl attribute 0 Foo')).toBeVisible();

      const button = screen.getByLabelText(
        `Remove merged facet for ${attributeValuesMock[0].displayValue}`
      );

      act(() => {
        button.click();
      });

      expect(
        screen.getByTestId(
          `algoControl attribute 1 ${attributeValuesMock[0].displayValue}`
        )
      ).toBeVisible();
      expect(screen.getByTestId('algoControl attribute 0 Foo')).toBeVisible();
    });

    it('should remove the merge group if there is only 1 value left after removing a value', async () => {
      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={attributeValuesMock}
          facet={{
            ...mockFacet,
            merged: [
              {
                displayValue: 'Foo',
                mergedValues: [
                  attributeValuesMock[0].displayValue,
                  attributeValuesMock[1].displayValue,
                ],
              },
            ],
            boosted: [],
            excludedValues: [],
          }}
          {...defaultProps}
          onClose={jest.fn()}
        />
      );

      const mergeGroup = screen.getByTestId('algoControl attribute 0 Foo');
      expect(mergeGroup).toBeVisible();

      const button = screen.getByLabelText(
        `Remove merged facet for ${attributeValuesMock[0].displayValue}`
      );

      act(() => {
        button.click();
      });

      expect(
        screen.getByTestId(
          `algoControl attribute 1 ${attributeValuesMock[0].displayValue}`
        )
      ).toBeVisible();
      expect(
        screen.getByTestId(
          `algoControl attribute 0 ${attributeValuesMock[1].displayValue}`
        )
      ).toBeVisible();
      expect(mergeGroup).not.toBeVisible();
    });
  });

  describe('searching', () => {
    it('should display the correct amount of filtered items when the merge group name matches the filter', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={attributeValuesMock}
          facet={{
            ...mockFacet,
            merged: [
              {
                displayValue: 'Foo',
                mergedValues: [
                  attributeValuesMock[0].displayValue,
                  attributeValuesMock[1].displayValue,
                ],
              },
            ],
            boosted: [],
            excludedValues: [],
          }}
          {...defaultProps}
          onClose={jest.fn()}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search...');

      await user.type(searchInput, 'foo');

      await waitFor(() => {
        expect(screen.getByText('1 result')).toBeInTheDocument();
      });
    });

    it('should display the correct amount of filtered items when the attribute values matches the filter', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={attributeValuesMock}
          facet={mockFacet}
          {...defaultProps}
          onClose={jest.fn()}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search...');

      await user.type(searchInput, '13');

      await waitFor(() => {
        expect(screen.getByText('2 results')).toBeInTheDocument();
      });
    });

    it('should display the correct amount of filtered items when the merged value group includes it', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={attributeValuesMock}
          facet={{
            ...mockFacet,
            merged: [
              {
                displayValue: 'Foo',
                mergedValues: ['white wine', 'red wine'],
              },
            ],
          }}
          {...defaultProps}
          onClose={jest.fn()}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search...');

      await user.type(searchInput, 'wine');

      await waitFor(() => {
        expect(screen.getByText('1 result')).toBeInTheDocument();
      });
    });
  });

  describe('show more/fewer', () => {
    it('should only display 4 merged values', () => {
      const mockOnClose = jest.fn();
      mockUpdateGlobalFacet.mockResolvedValueOnce(mockFacet);

      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={attributeValuesMock}
          facet={{
            id: mockFacet.id,
            indexPropertyName: mockFacet.indexPropertyName,
            displayValue: mockFacet.displayValue,
            lastChanged: mockFacet.lastChanged,
            merged: [
              {
                displayValue: 'Foo',
                mergedValues: [
                  attributeValuesMock[0].displayValue,
                  attributeValuesMock[1].displayValue,
                  attributeValuesMock[2].displayValue,
                  attributeValuesMock[3].displayValue,
                  attributeValuesMock[4].displayValue,
                ],
              },
            ],
          }}
          countryCode="UK"
          onClose={mockOnClose}
          writeEnabled
        />
      );

      expect(screen.getByText('Merged Value Group')).toBeVisible();

      expect(
        screen.getByText(attributeValuesMock[3].displayValue)
      ).toBeVisible();
      expect(
        screen.queryByText(attributeValuesMock[4].displayValue)
      ).not.toBeInTheDocument();
    });

    it('should display all of the merged values when the group is expanded', async () => {
      const user = userEvent.setup({ delay: null });
      const mockOnClose = jest.fn();
      mockUpdateGlobalFacet.mockResolvedValueOnce(mockFacet);

      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={attributeValuesMock}
          facet={{
            id: mockFacet.id,
            indexPropertyName: mockFacet.indexPropertyName,
            displayValue: mockFacet.displayValue,
            lastChanged: mockFacet.lastChanged,
            merged: [
              {
                displayValue: 'Foo',
                mergedValues: [
                  attributeValuesMock[0].displayValue,
                  attributeValuesMock[1].displayValue,
                  attributeValuesMock[2].displayValue,
                  attributeValuesMock[3].displayValue,
                  attributeValuesMock[4].displayValue,
                ],
              },
            ],
          }}
          countryCode="UK"
          onClose={mockOnClose}
          writeEnabled
        />
      );

      expect(screen.getByText('Merged Value Group')).toBeVisible();

      expect(
        screen.queryByText(attributeValuesMock[4].displayValue)
      ).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Show More' }));

      await waitFor(() => {
        expect(
          screen.getByText(attributeValuesMock[4].displayValue)
        ).toBeVisible();
      });
    });
  });

  describe('selection of all values', () => {
    it('should select all values when the checkbox is checked', () => {
      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={attributeValuesMock}
          facet={{
            id: mockFacet.id,
            indexPropertyName: mockFacet.indexPropertyName,
            displayValue: mockFacet.displayValue,
            lastChanged: mockFacet.lastChanged,
            merged: [
              {
                displayValue: 'Foo',
                mergedValues: [
                  attributeValuesMock[0].displayValue,
                  attributeValuesMock[1].displayValue,
                  attributeValuesMock[2].displayValue,
                  attributeValuesMock[3].displayValue,
                  attributeValuesMock[4].displayValue,
                ],
              },
            ],
          }}
          countryCode="UK"
          onClose={jest.fn()}
          writeEnabled
        />
      );

      const button = screen.getByLabelText('Select all facet attributes');
      expect(button).not.toBeChecked();

      act(() => {
        button.click();
      });

      expect(screen.getByRole('button', { name: 'Merge (5)' })).toBeVisible();
      expect(button).toBeChecked();
    });

    it('should select all values when the checkbox is checked and some values are already selected', () => {
      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={attributeValuesMock}
          facet={{ ...mockFacet, merged: [], boosted: [], excludedValues: [] }}
          countryCode="UK"
          onClose={jest.fn()}
          writeEnabled
        />
      );

      const checkbox1 = screen.getByLabelText(
        `Select ${attributeValuesMock[0].displayValue} to merge`
      );

      act(() => {
        checkbox1.click();
      });

      expect(screen.getByRole('button', { name: 'Merge (1)' })).toBeVisible();

      const button = screen.getByLabelText('Select all facet attributes');

      act(() => {
        button.click();
      });

      expect(screen.getByRole('button', { name: 'Merge (5)' })).toBeVisible();
    });

    it('should check the select all checkbox when all values are selected individually', () => {
      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={attributeValuesMock}
          facet={{ ...mockFacet, merged: [], boosted: [], excludedValues: [] }}
          countryCode="UK"
          onClose={jest.fn()}
          writeEnabled
        />
      );

      const checkbox1 = screen.getByLabelText(
        `Select ${attributeValuesMock[0].displayValue} to merge`
      );

      act(() => {
        checkbox1.click();
      });

      const checkbox2 = screen.getByLabelText(
        `Select ${attributeValuesMock[1].displayValue} to merge`
      );

      act(() => {
        checkbox2.click();
      });

      const checkbox3 = screen.getByLabelText(
        `Select ${attributeValuesMock[2].displayValue} to merge`
      );

      act(() => {
        checkbox3.click();
      });

      const checkbox4 = screen.getByLabelText(
        `Select ${attributeValuesMock[3].displayValue} to merge`
      );

      act(() => {
        checkbox4.click();
      });

      const checkbox5 = screen.getByLabelText(
        `Select ${attributeValuesMock[4].displayValue} to merge`
      );

      act(() => {
        checkbox5.click();
      });

      const selectAllButton = screen.getByLabelText(
        'Select all facet attributes'
      );

      expect(selectAllButton).toBeChecked();

      expect(screen.getByRole('button', { name: 'Merge (5)' })).toBeVisible();
    });

    it('should uncheck the select all checkbox when a value is deselected individually', () => {
      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={attributeValuesMock}
          facet={{ ...mockFacet, merged: [], boosted: [], excludedValues: [] }}
          countryCode="UK"
          onClose={jest.fn()}
          writeEnabled
        />
      );

      const checkbox1 = screen.getByLabelText(
        `Select ${attributeValuesMock[0].displayValue} to merge`
      );

      const selectAllButton = screen.getByLabelText(
        'Select all facet attributes'
      );

      act(() => {
        selectAllButton.click();
      });

      expect(selectAllButton).toBeChecked();
      expect(screen.getByRole('button', { name: 'Merge (5)' })).toBeVisible();

      act(() => {
        checkbox1.click();
      });

      expect(selectAllButton).not.toBeChecked();

      expect(screen.getByRole('button', { name: 'Merge (4)' })).toBeVisible();
    });

    it('should deselect all values when the checkbox is unchecked', () => {
      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={attributeValuesMock}
          facet={{ ...mockFacet, merged: [], boosted: [], excludedValues: [] }}
          countryCode="UK"
          onClose={jest.fn()}
          writeEnabled
        />
      );

      const button = screen.getByLabelText('Select all facet attributes');

      act(() => {
        button.click();
      });

      expect(screen.getByRole('button', { name: 'Merge (5)' })).toBeVisible();

      act(() => {
        button.click();
      });

      expect(screen.getByRole('button', { name: 'Merge (0)' })).toBeVisible();
    });

    it('should remove the item from selected when removed from a selected merge group', () => {
      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={attributeValuesMock}
          facet={{
            ...mockFacet,
            merged: [
              {
                displayValue: 'Merge Foo',
                mergedValues: [
                  attributeValuesMock[0].displayValue,
                  attributeValuesMock[1].displayValue,
                  attributeValuesMock[2].displayValue,
                ],
              },
            ],
            boosted: [],
            excludedValues: [],
          }}
          countryCode="UK"
          onClose={jest.fn()}
          writeEnabled
        />
      );

      const checkbox1 = screen.getByLabelText(`Select Merge Foo to merge`);

      act(() => {
        checkbox1.click();
      });

      expect(screen.getByRole('button', { name: 'Merge (3)' })).toBeVisible();

      const button = screen.getByRole('button', {
        name: `Remove merged facet for ${attributeValuesMock[0].displayValue}`,
      });

      act(() => {
        button.click();
      });

      expect(screen.getByRole('button', { name: 'Merge (2)' })).toBeVisible();
    });

    it('should not add the item to selected when removed from an unselected merge group', () => {
      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={attributeValuesMock}
          facet={{
            ...mockFacet,
            merged: [
              {
                displayValue: 'Foo',
                mergedValues: [
                  attributeValuesMock[0].displayValue,
                  attributeValuesMock[1].displayValue,
                  attributeValuesMock[2].displayValue,
                ],
              },
            ],
            boosted: [],
            excludedValues: [],
          }}
          countryCode="UK"
          onClose={jest.fn()}
          writeEnabled
        />
      );

      expect(screen.getByRole('button', { name: 'Merge (0)' })).toBeVisible();

      const button = screen.getByRole('button', {
        name: `Remove merged facet for ${attributeValuesMock[2].displayValue}`,
      });

      act(() => {
        button.click();
      });

      expect(screen.getByRole('button', { name: 'Merge (0)' })).toBeVisible();
    });
  });
});
