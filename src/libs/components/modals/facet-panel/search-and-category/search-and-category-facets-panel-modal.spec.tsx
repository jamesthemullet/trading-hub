import { screen, waitFor } from '@testing-library/react';
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
  writeEnabled: true,
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
          id: '1',
          boosted: ['Silk', 'More Silk'],
          excludedValues: ['Cotton', 'Duck Down', 'Duck Down And Feather'],
        }}
      />
    );

    expect(screen.getAllByTestId('attribute-value-skeleton')).toHaveLength(11);
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
          id: '1',
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
          id: '1',
          boosted: ['Silk', 'More Silk'],
          excludedValues: ['Cotton', 'Duck Down', 'Duck Down And Feather'],
        }}
        categories={undefined}
      />
    );

    await user.click(screen.getByLabelText('Close attributes modal'));

    expect(onCloseSpy).toHaveBeenCalled();
  });

  describe('facet value rows', () => {
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

    it('should dispatch CHANGE_DISPLAY_TYPE', async () => {
      (lodash.without as jest.Mock).mockReturnValue(['Cotton', 'Silk']);

      renderWithProviders(
        <SearchAndCategoryFacetsPanelModal
          {...mockDefaultCategoryFacetProps}
          facet={{ ...facetMock, boosted: ['Cotton', 'Silk'] }}
        />
      );

      const boostedValue = screen.getByTestId('included attribute 0 Cotton');

      expect(boostedValue).toBeVisible();

      const dropdownHeader = screen.getAllByText('Include only')[0];
      await userEvent.click(dropdownHeader);

      const algoControlOption = screen.getByLabelText('exclude Cotton');
      await userEvent.click(algoControlOption);

      expect(boostedValue).not.toBeVisible();
    });
  });
});
