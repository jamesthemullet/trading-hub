import { useCallback, useMemo, useReducer, useState } from 'react';
import { Modal } from '@mantine/core';

import type {
  MerchandisingAttributeValuesResponse,
  MerchandisingCountryCode,
  MerchandisingRuleSetFacetConfigWithId,
} from '@/libs/api';
import {
  ArrowButton,
  Button,
  CombinedDropdown,
  ErrorMessage,
  FacetOrderInput,
  FilteredResultsPanel,
  Search,
  Typography,
} from '@/libs/components';
import editFacetStyles from '@/libs/components/edit-facet-modal-content/edit-facet-modal-content.module.css';
import modalStyles from '@/libs/components/modals/modal.module.css';
import { SearchCategoryFacetAttributeValuesTableRow } from '@/libs/containers/shared/table/table.styles';
import facetPanelStyles from '@/libs/features/facets/facets-panel/facets-panel.module.css';
import { useGetFacetAttributeValues } from '@/libs/hooks';
import { useFacetOrderInput } from '@/libs/hooks/use-facet-order-input';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';
import type { FacetDisplayType } from '@/libs/stores/facets-panel/facets-panel-reducer';
import { facetReducer } from '@/libs/stores/search-and-category/facet-reducer';

import { intersection, without } from 'lodash';

const MODAL_WIDTH = 1150;

const EDITFACETVALUESMODALCOLUMNS: {
  label: string | null;
}[] = [
  {
    label: 'Attribute',
  },
  {
    label: 'Ranking',
  },
  {
    label: 'Display name',
  },
  {
    label: 'Position Set',
  },
  {
    label: 'Actions',
  },
];

export const SearchAndCategoryFacetsPanelModal = ({
  onClose,
  onSave,
  facet,
  saveButtonLabel = 'Save',
  categories,
  countryCode,
  writeEnabled,
  searchTerms,
}: {
  onClose: () => void;
  onSave: (facet: MerchandisingRuleSetFacetConfigWithId) => void;
  facet: MerchandisingRuleSetFacetConfigWithId & { displayValue: string };
  countryCode: MerchandisingCountryCode;
  saveButtonLabel?: string;
  categories?: string[];
  writeEnabled: boolean;
  searchTerms?: string[];
}) => {
  const [isSaveDisabled] = useState(false);
  const processedFacet = useMemo(() => {
    const intersectedValues = intersection(facet.boosted, facet.excludedValues);

    const boosted = without(facet.boosted, ...intersectedValues);
    const orderedBoostedList = boosted.map((item, index) => ({
      displayValue: item,
      order: index + 1,
    }));

    return {
      ...facet,
      ...(boosted.length > 0 && { boosted }),
      orderedBoostedList,
    };
  }, [facet]);

  const [facetLocalState, dispatch] = useReducer(facetReducer, processedFacet);

  const initialOrders = useMemo(
    () =>
      Object.fromEntries(
        facetLocalState.orderedBoostedList.map((item) => [
          item.displayValue,
          item.order,
        ])
      ),
    [facetLocalState.orderedBoostedList]
  );

  const handleOrderChange = useCallback(
    (displayValue: string, newIndex: number) => {
      dispatch({
        type: 'SET_BOOSTED_ORDER',
        payload: { id: displayValue, newIndex },
      });
    },
    []
  );

  const {
    getInputRef,
    localOrders,
    handleInputChange,
    handleInputBlur,
    handleInputKeyDown,
  } = useFacetOrderInput(handleOrderChange, initialOrders);

  const handleSave = async () => {
    onSave(facetLocalState);
  };

  const [searchQuery, setSearchQuery] = useState('');

  const {
    attributeValues,
    error: attributeValuesError,
    isLoading,
  } = useGetFacetAttributeValues({
    facetId: facet.id,
    query: searchQuery,
    categories,
    searchTerms,
    countryCode,
  });

  const algoControlValues = attributeValues
    .filter((value) => !facetLocalState.boosted!.includes(value.displayValue))
    .filter(
      (value) => !facetLocalState.excludedValues?.includes(value.displayValue)
    );
  const boostedValues = facetLocalState.boosted!.map((value) => ({
    displayValue: value,
  }));

  const excludedValues = attributeValues.filter((value) =>
    facetLocalState.excludedValues?.includes(value.displayValue)
  );

  const { callback: handleSearch } = useDebounce(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
    },
    300
  );

  const handleDisplayTypeChange = useCallback(
    (newDisplayType: FacetDisplayType, displayValue: string) => {
      dispatch({
        type: 'CHANGE_DISPLAY_TYPE',
        payload: {
          id: displayValue,
          newDisplayType,
        },
      });
    },
    []
  );

  const listValues = useCallback(
    (
      values: MerchandisingAttributeValuesResponse['values'],
      displayType: FacetDisplayType,
      orderedBoostedList?: { displayValue: string; order: number }[]
    ) => {
      const filteredRows = values.filter((row) =>
        row.displayValue.toLowerCase().includes(searchQuery.toLowerCase())
      );

      return filteredRows.map(({ displayValue }, index) => {
        const order =
          orderedBoostedList?.find((item) => item.displayValue === displayValue)
            ?.order || 0;
        const localOrder = localOrders[displayValue] ?? order;

        return (
          <SearchCategoryFacetAttributeValuesTableRow
            key={`${displayType}-${displayValue}`}
            isPinned={displayType === 'included'}
            isExcluded={displayType === 'excluded'}
            data-testid={`${displayType} attribute ${index} ${displayValue}`}
            modal
          >
            <div className={facetPanelStyles.tableCol}>
              <div className={editFacetStyles.attributeWrapper}>
                <Typography variant="bodySmall">{displayValue}</Typography>
              </div>
            </div>

            <div className={facetPanelStyles.tableCol}>
              {displayType === 'included' && (
                <div className={editFacetStyles.attributeWrapper}>
                  <FacetOrderInput
                    displayValue={displayValue}
                    order={order}
                    localOrder={localOrder}
                    inputRef={getInputRef(displayValue)}
                    onInputChange={handleInputChange}
                    onInputBlur={handleInputBlur}
                    onInputKeyDown={handleInputKeyDown}
                    writeEnabled={writeEnabled}
                  />
                </div>
              )}
            </div>

            <div className={facetPanelStyles.tableCol}>
              <Typography
                variant="bodySmall"
                data-testid={`Label for ${displayValue}`}
              >
                {displayValue}
              </Typography>
            </div>

            <div className={facetPanelStyles.tableCol}>
              {displayType === 'included' && (
                <div className={editFacetStyles.orderArrowsContainer}>
                  <ArrowButton
                    direction="up"
                    label={`Move ${displayValue} row up`}
                    isDisabled={index === 0 || !!searchQuery}
                    onClick={() => {
                      dispatch({
                        type: 'MOVE_BOOSTED_ROW_UP',
                        payload: { id: displayValue },
                      });
                    }}
                  />

                  <ArrowButton
                    direction="down"
                    label={`Move ${displayValue} row down`}
                    isDisabled={
                      index === filteredRows.length - 1 || !!searchQuery
                    }
                    onClick={() => {
                      dispatch({
                        type: 'MOVE_BOOSTED_ROW_DOWN',
                        payload: { id: displayValue },
                      });
                    }}
                  />
                </div>
              )}
            </div>

            <div className={facetPanelStyles.tableCol}>
              <CombinedDropdown
                variant="facetOrder"
                hasAlgoControl
                onChange={(newDisplayType) => {
                  handleDisplayTypeChange(
                    newDisplayType as FacetDisplayType,
                    displayValue
                  );
                }}
                status={displayType}
                attribute={displayValue}
                writeEnabled={writeEnabled}
                ariaLabel="Select to set as included, excluded or algo control"
              />
            </div>
          </SearchCategoryFacetAttributeValuesTableRow>
        );
      });
    },
    [
      searchQuery,
      writeEnabled,
      handleDisplayTypeChange,
      handleInputChange,
      handleInputBlur,
      handleInputKeyDown,
      localOrders,
      getInputRef,
    ]
  );

  const boostedValuesRows = useMemo(() => {
    return listValues(
      boostedValues,
      'included',
      facetLocalState.orderedBoostedList
    );
  }, [boostedValues, listValues, facetLocalState.orderedBoostedList]);

  const defaultValuesRows = useMemo(() => {
    return listValues(algoControlValues, 'algoControl', []);
  }, [algoControlValues, listValues]);

  const excludedValuesRows = useMemo(() => {
    return listValues(excludedValues, 'excluded', []);
  }, [excludedValues, listValues]);

  return (
    <Modal.Root
      opened
      onClose={onClose}
      centered
      size={MODAL_WIDTH}
      padding={0}
      role="dialog"
      aria-modal="true"
      aria-label="Edit facet values modal"
    >
      <Modal.Overlay blur={3} />
      <Modal.Content>
        <Modal.Body>
          <div className={modalStyles.modalContainer}>
            <div className={modalStyles.headingContainer}>
              <Typography isStrong as="h3" variant="titleMedium">
                Facet value settings of: {facet.displayValue}
              </Typography>
            </div>

            {attributeValuesError && (
              <ErrorMessage>
                Error whilst retrieving values: {attributeValuesError}
              </ErrorMessage>
            )}

            <div className={editFacetStyles.mergeAndSearchContainer}>
              <Typography variant="bodySmall" isStrong>
                All values listed
              </Typography>

              <Search onChange={handleSearch} />
            </div>

            <div className={modalStyles.modalAttributesTable}>
              <SearchCategoryFacetAttributeValuesTableRow modal>
                {EDITFACETVALUESMODALCOLUMNS.map(({ label }) => (
                  <div
                    key={`add-facet-modal-column-${label}`}
                    className={facetPanelStyles.tableCol}
                  >
                    <Typography isStrong variant="bodySmall">
                      {label}
                    </Typography>
                  </div>
                ))}
              </SearchCategoryFacetAttributeValuesTableRow>
            </div>

            <div>
              {isLoading ? (
                attributeValues.map((attribute) => (
                  <div
                    key={`attribute-value-skeleton-${attribute.displayValue}`}
                    data-testid="attribute-value-skeleton"
                    aria-busy="true"
                    className={editFacetStyles.skeletonRow}
                  />
                ))
              ) : (
                <div className={modalStyles.modalAttributesTable}>
                  {boostedValuesRows}

                  {defaultValuesRows}

                  {excludedValuesRows}
                </div>
              )}

              <FilteredResultsPanel filteredFacets={attributeValues.length} />
            </div>
          </div>
        </Modal.Body>

        <div className={modalStyles.modalFooter}>
          <Button onClick={onClose} aria-label="Close attributes modal">
            Cancel
          </Button>{' '}
          <Button
            onClick={handleSave}
            isDisabled={isSaveDisabled}
            aria-label="Save changes to attributes"
          >
            {saveButtonLabel}
          </Button>
        </div>
      </Modal.Content>
    </Modal.Root>
  );
};
