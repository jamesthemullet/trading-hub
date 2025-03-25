import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { AttributeValuesResponse, ReturnedGlobalFacet } from '@/libs/api';
import {
  useCheckMergeNameUnique,
  useGetFacetAttributeValues,
  useGlobalFacetUpdate,
} from '@/libs/hooks';
import { renderWithProviders } from '@/test/render-with-providers';

import {
  DEFAULT_MERGE_DISPLAY_NAME,
  GlobalFacetPanelModal,
  GlobalFacetPanelModalContent,
} from './global-facets-panel-modal';

const mockUpdateGlobalFacet = jest.fn(() =>
  Promise.resolve({} as ReturnedGlobalFacet | { status: string })
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

const mockFacet: ReturnedGlobalFacet = {
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

const attributeValuesMock: AttributeValuesResponse['values'] = [
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
        countryCode="UK"
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
        countryCode="UK"
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
        countryCode="UK"
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
        countryCode="UK"
        onClose={mockOnClose}
      />
    );

    const saveButton = screen.getByRole('button', { name: 'Save' });

    saveButton.click();

    await waitFor(() => expect(mockOnClose).toHaveBeenCalled());
  });

  it('should not close on save error', async () => {
    mockUpdateGlobalFacet.mockResolvedValueOnce({ status: 'error' });
    const mockOnClose = jest.fn();

    renderWithProviders(
      <GlobalFacetPanelModalContent
        attributeValues={attributeValuesMock}
        facet={mockFacet}
        countryCode="UK"
        onClose={mockOnClose}
      />
    );

    const saveButton = screen.getByRole('button', { name: 'Save' });
    saveButton.click();

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
        countryCode="UK"
        onClose={mockOnClose}
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
          countryCode="UK"
          onClose={mockOnClose}
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
          countryCode="UK"
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
          countryCode="UK"
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
          countryCode="UK"
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
    });

    it('should allow renaming to the same name', async () => {
      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={attributeValuesMock}
          facet={{ ...mockFacet, merged: [], boosted: [], excludedValues: [] }}
          countryCode="UK"
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
      jest.mocked(useCheckMergeNameUnique).mockReturnValueOnce({
        checkMergeNameUnique: () =>
          Promise.resolve({
            isUniqueValue: false,
          }),
        error: '',
      });

      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={attributeValuesMock}
          facet={{ ...mockFacet, merged: [], boosted: [], excludedValues: [] }}
          countryCode="UK"
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

    it('should not allow renaming a row to the default value', async () => {
      jest.mocked(useCheckMergeNameUnique).mockReturnValueOnce({
        checkMergeNameUnique: () =>
          Promise.resolve({
            isUniqueValue: true,
          }),
        error: '',
      });

      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={attributeValuesMock}
          facet={{ ...mockFacet, merged: [], boosted: [], excludedValues: [] }}
          countryCode="UK"
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
        await userEvent.type(inputField, DEFAULT_MERGE_DISPLAY_NAME);
        await userEvent.keyboard('{enter}');
      });

      await waitFor(() => {
        const errorMessage = screen.getByText(
          `${DEFAULT_MERGE_DISPLAY_NAME} is not a unique value`
        );
        expect(errorMessage).toBeVisible();
      });
    });

    it('should open actions dropdown and make no changes if algo control is chosen', async () => {
      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={[attributeValuesMock[0]]}
          facet={{ ...mockFacet, merged: [], boosted: [], excludedValues: [] }}
          countryCode="UK"
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
          facet={{ ...mockFacet, merged: [], boosted: [], excludedValues: [] }}
          countryCode="UK"
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
          countryCode="UK"
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
          countryCode="UK"
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
          countryCode="UK"
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
          countryCode="UK"
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
          countryCode="UK"
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
          countryCode="UK"
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
          countryCode="UK"
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
          countryCode="UK"
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
          countryCode="UK"
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
          countryCode="UK"
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

      expect(
        screen.getByText('Please name your merge to continue')
      ).toBeVisible();

      const inputField = await screen.findByLabelText(
        `Edit ${DEFAULT_MERGE_DISPLAY_NAME} input field`
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
          countryCode="UK"
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

      expect(
        screen.getByText('Please name your merge to continue')
      ).toBeVisible();

      const inputField = await screen.findByLabelText(
        `Edit ${DEFAULT_MERGE_DISPLAY_NAME} input field`
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
          countryCode="UK"
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
          countryCode="UK"
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
          countryCode="UK"
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

      expect(
        screen.getByText('Please name your merge to continue')
      ).toBeVisible();

      const inputField = await screen.findByLabelText(
        `Edit ${DEFAULT_MERGE_DISPLAY_NAME} input field`
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
          countryCode="UK"
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

      expect(
        screen.getByText('Please name your merge to continue')
      ).toBeVisible();

      const inputField = await screen.findByLabelText(
        `Edit ${DEFAULT_MERGE_DISPLAY_NAME} input field`
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
          countryCode="UK"
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

      expect(
        screen.getByText('Please name your merge to continue')
      ).toBeVisible();

      const inputField = await screen.findByLabelText(
        `Edit ${DEFAULT_MERGE_DISPLAY_NAME} input field`
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

    it('should allow renmaing the merge group to a merged attribute', async () => {
      renderWithProviders(
        <GlobalFacetPanelModalContent
          attributeValues={attributeValuesMock}
          facet={{ ...mockFacet, merged: [], boosted: [], excludedValues: [] }}
          countryCode="UK"
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

      expect(
        screen.getByText('Please name your merge to continue')
      ).toBeVisible();

      const inputField = await screen.findByLabelText(
        `Edit ${DEFAULT_MERGE_DISPLAY_NAME} input field`
      );

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
          countryCode="UK"
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
          `algoControl attribute 0 ${attributeValuesMock[0].displayValue}`
        )
      ).toBeVisible();
      expect(screen.getByTestId('algoControl attribute 1 Foo')).toBeVisible();
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
          countryCode="UK"
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
          `algoControl attribute 0 ${attributeValuesMock[0].displayValue}`
        )
      ).toBeVisible();
      expect(
        screen.getByTestId(
          `algoControl attribute 1 ${attributeValuesMock[1].displayValue}`
        )
      ).toBeVisible();
      expect(mergeGroup).not.toBeVisible();
    });
  });
});
