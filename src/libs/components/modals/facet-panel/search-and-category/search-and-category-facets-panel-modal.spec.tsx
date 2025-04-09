import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type {
  MerchandisingCountryCode,
  MerchandisingReturnedGlobalFacet,
} from '@/libs/api';
import { useGetFacetAttributeValues, useGlobalFacetUpdate } from '@/libs/hooks';
import { attributeValuesMock } from '@/pages/api/search/mocks';
import { renderWithProviders } from '@/test/render-with-providers';

import * as lodash from 'lodash';

import { SearchAndCategoryFacetsPanelModal } from './search-and-category-facets-panel-modal';

jest.mock('@/libs/hooks/use-get-facet-attribute-values', () => ({
  ...jest.requireActual('@/libs/hooks/use-get-facet-attribute-values'),
  useGetFacetAttributeValues: jest.fn(),
}));

jest.mock('lodash', () => ({
  ...jest.requireActual('lodash'),
  intersection: jest.fn(),
  without: jest.fn(),
}));

jest.mock('@/libs/hooks/use-check-merge-name-unique', () => ({
  ...jest.requireActual('@/libs/hooks/use-check-merge-name-unique'),
  useCheckMergeNameUnique: jest.fn(),
}));

const facetMock = {
  displayValue: 'color',
  indexPropertyName: 'color',
  id: '1',
  lastChanged: { user: 'Bob', date: '2021-10-01' },
  boosted: [],
  excludedValues: [],
  merged: [],
};

const onCloseSpy = jest.fn();
const onSaveSpy = jest.fn();

const countryCode: MerchandisingCountryCode = 'UK';

const mockDefaultCategoryFacetProps = {
  onClose: onCloseSpy,
  onSave: onSaveSpy,
  facet: facetMock,
  mergeEnabled: false,
  displayValueEditEnabled: true,
  removeFacetValueFromMergeGroupEnabled: false,
  categories: ['SubCategory_507'],
  countryCode,
};

const mockUpdateGlobalFacet = jest.fn(() =>
  Promise.resolve({} as MerchandisingReturnedGlobalFacet | { status: string })
);
const updateGlobalFacet = {
  handleGlobalFacetUpdate: mockUpdateGlobalFacet,
  error: '',
};

jest.mock('@/libs/hooks/global/facets/use-global-facet-update', () => ({
  ...jest.requireActual('@/libs/hooks/global/facets/use-global-facet-update'),
  useGlobalFacetUpdate: jest.fn(),
}));

describe('ModalEditValues', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (lodash.intersection as jest.Mock).mockReturnValue(['red']);
    (lodash.without as jest.Mock).mockReturnValue(['blue', 'green']);
    jest.mocked(useGlobalFacetUpdate).mockReturnValue(updateGlobalFacet);
    jest.mocked(useGetFacetAttributeValues).mockReturnValue({
      attributeValues: attributeValuesMock,
      error: '',
      isLoading: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render edit values modal', async () => {
    renderWithProviders(
      <SearchAndCategoryFacetsPanelModal {...mockDefaultCategoryFacetProps} />
    );

    expect(
      await screen.findByText('Facet value settings of: color')
    ).toBeVisible();
  });

  it('should close the modal', async () => {
    renderWithProviders(
      <SearchAndCategoryFacetsPanelModal {...mockDefaultCategoryFacetProps} />
    );

    const closeButton = await screen.findByLabelText('Close attributes modal');

    await userEvent.click(closeButton);

    expect(onCloseSpy).toHaveBeenCalledTimes(1);
  });

  it('should filter values', async () => {
    renderWithProviders(
      <SearchAndCategoryFacetsPanelModal {...mockDefaultCategoryFacetProps} />
    );
    const blueRow = screen.getByTestId('Label for blue');
    const greenRow = screen.getByTestId('Label for green');
    expect(greenRow).toBeVisible();
    expect(blueRow).toBeVisible();

    const searchInput = await screen.findByPlaceholderText('Search...');

    await userEvent.type(searchInput, 'blue');

    await waitFor(() => {
      expect(greenRow).not.toBeVisible();
    });

    expect(blueRow).toBeVisible();
  });

  it('should save the modal', async () => {
    renderWithProviders(
      <SearchAndCategoryFacetsPanelModal {...mockDefaultCategoryFacetProps} />
    );

    const saveButton = await screen.findByText('Save');

    await userEvent.click(saveButton);

    expect(onSaveSpy).toHaveBeenCalledTimes(1);
  });

  it('should remove duplicated values', async () => {
    renderWithProviders(
      <SearchAndCategoryFacetsPanelModal
        {...mockDefaultCategoryFacetProps}
        facet={{
          ...facetMock,
          boosted: ['red', 'Red', 'blue', 'green'],
          excludedValues: ['red', 'yellow'],
        }}
      />
    );

    expect(
      await screen.findByText('Facet value settings of: color')
    ).toBeVisible();

    expect(lodash.intersection).toHaveBeenCalledWith(
      ['red', 'Red', 'blue', 'green'],
      ['red', 'yellow']
    );
    expect(lodash.without).toHaveBeenCalledWith(
      ['red', 'Red', 'blue', 'green'],
      'red'
    );
  });

  it('should display loader components when retrieving attributes', async () => {
    jest.mocked(useGetFacetAttributeValues).mockReturnValue({
      attributeValues: attributeValuesMock,
      error: '',
      isLoading: true,
    });

    renderWithProviders(
      <SearchAndCategoryFacetsPanelModal
        {...mockDefaultCategoryFacetProps}
        facet={{
          displayValue: 'color',
          indexPropertyName: 'color',
          id: '1',
          lastChanged: { user: 'Bob', date: '2021-10-01' },
          boosted: ['Silk', 'More Silk'],
          excludedValues: ['Cotton', 'Duck Down', 'Duck Down And Feather'],
        }}
      />
    );

    expect(screen.getAllByTestId('attribute-value-skeleton')).toHaveLength(13);
  });

  it('should display error message when retrieving attributes fails', async () => {
    jest.mocked(useGetFacetAttributeValues).mockReturnValue({
      attributeValues: [],
      error: 'Unknown error',
      isLoading: false,
    });

    renderWithProviders(
      <SearchAndCategoryFacetsPanelModal
        {...mockDefaultCategoryFacetProps}
        facet={{
          displayValue: 'color',
          indexPropertyName: 'color',
          id: '1',
          lastChanged: { user: 'Bob', date: '2021-10-01' },
          boosted: ['Silk', 'More Silk'],
          excludedValues: ['Cotton', 'Duck Down', 'Duck Down And Feather'],
        }}
        categories={undefined}
      />
    );

    expect(
      screen.getByText('Error whilst retrieving values: Unknown error')
    ).toBeInTheDocument();
  });

  it('should cancel changes to a facet', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <SearchAndCategoryFacetsPanelModal
        {...mockDefaultCategoryFacetProps}
        facet={{
          displayValue: 'color',
          indexPropertyName: 'color',
          id: '1',
          lastChanged: { user: 'Bob', date: '2021-10-01' },
          boosted: ['Silk', 'More Silk'],
          excludedValues: ['Cotton', 'Duck Down', 'Duck Down And Feather'],
        }}
        categories={undefined}
      />
    );

    await user.click(screen.getByLabelText('Close attributes modal'));

    expect(onCloseSpy).toHaveBeenCalled();
  });

  describe('moving rows', () => {
    it('should move boosted row down', async () => {
      (lodash.without as jest.Mock).mockReturnValue(['Cotton', 'Silk']);

      renderWithProviders(
        <SearchAndCategoryFacetsPanelModal
          {...mockDefaultCategoryFacetProps}
          facet={{ ...facetMock, boosted: ['Cotton', 'Silk'] }}
        />
      );

      await userEvent.click(screen.getByLabelText('Move Cotton row down'));

      await waitFor(() => {
        expect(screen.getByLabelText('Move Cotton row down')).toBeDisabled();
      });
    });

    it('should dispatch MOVE_BOOSTED_ROW_UP', async () => {
      (lodash.without as jest.Mock).mockReturnValue(['Cotton', 'Silk']);

      renderWithProviders(
        <SearchAndCategoryFacetsPanelModal
          {...mockDefaultCategoryFacetProps}
          facet={{ ...facetMock, boosted: ['Cotton', 'Silk'] }}
        />
      );

      await userEvent.click(screen.getByLabelText('Move Silk row up'));

      await waitFor(() => {
        expect(screen.getByLabelText('Move Silk row up')).toBeDisabled();
      });
    });
  });

  describe('merged groups', () => {
    it('should render merge group without remove button', async () => {
      renderWithProviders(
        <SearchAndCategoryFacetsPanelModal
          {...mockDefaultCategoryFacetProps}
          facet={{
            ...facetMock,
            merged: [{ displayValue: 'red', mergedValues: ['red', 'blue'] }],
            excludedValues: ['red', 'blue'],
          }}
          categories={undefined}
        />
      );

      expect(await screen.findByTestId('Merged value red label')).toBeVisible();
    });

    it('should update included/excluded values for category facets, for both newly amended facets and existing unchanged facets', async () => {
      const user = userEvent.setup({ delay: null });

      renderWithProviders(
        <SearchAndCategoryFacetsPanelModal
          {...mockDefaultCategoryFacetProps}
          facet={{
            displayValue: 'color',
            indexPropertyName: 'color',
            id: '1',
            lastChanged: { user: 'Bob', date: '2021-10-01' },
            merged: [
              {
                displayValue: 'test merged group',
                mergedValues: ['merged 1', 'merged 2'],
              },
            ],
            excludedValues: [],
            boosted: [],
          }}
        />
      );
      await user.click(
        screen.getByTestId('button to open facet order dropdown for Silk')
      );
      await user.click(screen.getByLabelText('exclude Silk'));
      await user.click(
        screen.getByTestId('button to open facet order dropdown for More Silk')
      );
      await user.click(screen.getByLabelText('include More Silk'));
      await user.click(
        screen.getByTestId('button to open facet order dropdown for Duck Down')
      );
      await user.click(screen.getByLabelText('exclude Duck Down'));
      await user.click(
        screen.getByTestId(
          'button to open facet order dropdown for Ducky Downy And Feathery'
        )
      );
      await user.click(
        screen.getByLabelText('include Ducky Downy And Feathery')
      );
      act(() => {
        screen
          .getByRole('button', { name: 'Save changes to attributes' })
          .click();
      });
      await waitFor(async () =>
        expect(onSaveSpy).toHaveBeenCalledWith({
          boosted: ['blue', 'green', 'More Silk', 'Ducky Downy And Feathery'],
          displayValue: 'color',
          id: '1',
          indexPropertyName: 'color',
          lastChanged: { date: '2021-10-01', user: 'Bob' },
          excludedValues: ['Silk', 'Duck Down'],
          merged: [
            {
              displayValue: 'test merged group',
              mergedValues: ['merged 1', 'merged 2'],
            },
          ],
        })
      );
    });
  });
});
