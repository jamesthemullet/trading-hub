import styled from '@emotion/styled';
import type { ActionDispatch, Dispatch, SetStateAction } from 'react';
import { useCallback, useMemo } from 'react';

import type {
  MerchandisingAttributeValuesResponse,
  MerchandisingCountryCode,
  MerchandisingReturnedGlobalFacet,
} from '@/libs/api';
import { CombinedDropdown, FilteredResultsPanel } from '@/libs/components';
import { Col } from '@/libs/components/edit-facet-modal-content/edit-facet-modal-content.styles';
import { GlobalFacetAttribute } from '@/libs/containers';
import { GlobalArrowButtons } from '@/libs/containers/facets/global-arrow-buttons/global-arrow-buttons';
import { GlobalEditableLabel } from '@/libs/containers/facets/global-editable-label/global-editable-label';
import { FacetAttributeValuesTableRow } from '@/libs/containers/shared/table/table.styles';
import type { FacetDisplayType } from '@/libs/modules/facet-list/facet-list';
import type {
  FormattedRow,
  GlobalAttributeReducer,
  GlobalAttributesState,
} from '@/libs/stores/global-attribute/global-attribute-reducer';
import { spacing } from '@/libs/utils/spacing';

const GlobalFacetAttributesListContainer = styled.div`
  margin: 0 ${spacing(3)};
`;

export type GlobalFacetAttributesListProps = {
  attributeValues: MerchandisingAttributeValuesResponse['values'];
  searchQuery: string;
  countryCode: MerchandisingCountryCode;
  editingValues: string[];
  dispatch: ActionDispatch<[action: GlobalAttributeReducer]>;
  globalAttributesLocalState: GlobalAttributesState;
  writeEnabled: boolean;
  setEditingValues: Dispatch<SetStateAction<string[]>>;
  facet: MerchandisingReturnedGlobalFacet;
};

export const GlobalFacetAttributesList = ({
  attributeValues,
  searchQuery,
  countryCode,
  editingValues,
  dispatch,
  globalAttributesLocalState,
  writeEnabled,
  setEditingValues,
  facet,
}: GlobalFacetAttributesListProps) => {
  // No need for it now, mainly used for merge functionality
  // const [isAwaitingUpdate, setIsAwaitingUpdate] = useState(false);
  // useEffect(() => {
  //   if (!isAwaitingUpdate) return;

  //   setIsAwaitingUpdate(false);
  // }, [isAwaitingUpdate]);

  const listValues = useCallback(
    (values: FormattedRow[], displayType: FacetDisplayType) => {
      const filteredRows = values.filter(
        (row) =>
          row.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          row.attributes.some((val) =>
            val.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );

      return filteredRows.map(
        ({ displayName, attributes, isMergeGroup }, index) => {
          const onOrderChange = (status: FacetDisplayType) => {
            // setIsAwaitingUpdate(true);
            if (status === displayType) {
              return;
            }

            requestAnimationFrame(() => {
              if (displayType === 'included') {
                dispatch({
                  type: 'AMEND_BOOSTED_ROW',
                  payload: {
                    newStatus: status,
                    displayName,
                  },
                });
              }
              if (displayType === 'algoControl') {
                dispatch({
                  type: 'AMEND_NONBOOSTEDEXCLUDED_ROW',
                  payload: {
                    newStatus: status,
                    displayName,
                  },
                });
              }
              if (displayType === 'excluded') {
                dispatch({
                  type: 'AMEND_EXCLUDED_ROW',
                  payload: {
                    newStatus: status,
                    displayName,
                  },
                });
              }
            });
          };

          return (
            <FacetAttributeValuesTableRow
              key={`${displayType}-${displayName}`}
              isPinned={displayType === 'included'}
              isExcluded={displayType === 'excluded'}
              data-testid={`${displayType} attribute ${index} ${displayName}`}
            >
              <GlobalFacetAttribute
                attributes={attributes}
                isMergeGroup={isMergeGroup}
                displayName={displayName}
                // TODO: Implement merge functionality
                handleRemoveFromMerge={
                  // istanbul ignore next
                  () => {}
                }
                dispatch={dispatch}
                allSelected={globalAttributesLocalState.allSelected}
                allDeselected={globalAttributesLocalState.allDeselected}
              />

              <GlobalEditableLabel
                displayName={displayName}
                editingValues={editingValues}
                merged={globalAttributesLocalState.merged}
                boostedRows={globalAttributesLocalState.boostedRows}
                nonBoostedExcludedRows={
                  globalAttributesLocalState.nonBoostedExcludedRows
                }
                excludedRows={globalAttributesLocalState.excludedRows}
                facet={facet}
                countryCode={countryCode}
                dispatch={dispatch}
                setEditingValues={setEditingValues}
              />

              <Col>
                {displayType === 'included' && (
                  <GlobalArrowButtons
                    displayName={displayName}
                    index={index}
                    searchQuery={searchQuery}
                    boostedRows={globalAttributesLocalState.boostedRows}
                    attributes={attributes}
                    rows={filteredRows}
                    disableArrows={globalAttributesLocalState.disableArrows}
                    dispatch={dispatch}
                  />
                )}
              </Col>

              <Col>
                <CombinedDropdown
                  variant="facetOrder"
                  status={displayType}
                  attribute={displayName}
                  onChange={(status) =>
                    onOrderChange(status as FacetDisplayType)
                  }
                  writeEnabled={writeEnabled}
                  hasAlgoControl
                  ariaLabel="Select to set as included, excluded or algo control"
                />
              </Col>
            </FacetAttributeValuesTableRow>
          );
        }
      );
    },
    [
      searchQuery,
      countryCode,
      editingValues,
      facet,
      globalAttributesLocalState.allSelected,
      globalAttributesLocalState.allDeselected,
      globalAttributesLocalState.disableArrows,
      globalAttributesLocalState.boostedRows,
      globalAttributesLocalState.nonBoostedExcludedRows,
      globalAttributesLocalState.excludedRows,
      globalAttributesLocalState.merged,
      writeEnabled,
      dispatch,
      setEditingValues,
    ]
  );

  const boostedValuesRows = useMemo(() => {
    return listValues(globalAttributesLocalState.boostedRows, 'included');
  }, [globalAttributesLocalState.boostedRows, listValues]);

  const defaultValuesRows = useMemo(() => {
    return listValues(
      globalAttributesLocalState.nonBoostedExcludedRows,
      'algoControl'
    );
  }, [globalAttributesLocalState.nonBoostedExcludedRows, listValues]);

  const excludedValuesRows = useMemo(() => {
    return listValues(globalAttributesLocalState.excludedRows, 'excluded');
  }, [globalAttributesLocalState.excludedRows, listValues]);

  const filteredAttributeValues = attributeValues.filter((attribute) =>
    attribute.displayValue.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAttributeValuesNotInAMergeGroup =
    filteredAttributeValues.filter(
      (attribute) =>
        !globalAttributesLocalState.merged?.some((group) =>
          group.mergedValues?.includes(attribute.displayValue)
        )
    );

  const filteredMergeGroups = globalAttributesLocalState.merged?.filter(
    (group) =>
      group.displayValue?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.mergedValues?.some((val) =>
        val.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const totalFilteredResults =
    filteredAttributeValuesNotInAMergeGroup.length + filteredMergeGroups.length;

  return (
    <GlobalFacetAttributesListContainer>
      {boostedValuesRows}

      {defaultValuesRows}

      {excludedValuesRows}

      {/* {isAwaitingUpdate && <Loader isInModal />} */}

      <FilteredResultsPanel filteredFacets={totalFilteredResults} />
    </GlobalFacetAttributesListContainer>
  );
};
