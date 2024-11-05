import { useEffect, useReducer, useState } from 'react';

import {
  Category,
  ExcludedFacets,
  MerchandisingRules,
  ReturnedFacet,
} from '@/libs/api';
import {
  Button,
  CategorySearch,
  ProductGridHeader,
  Search,
  SelectedCategory,
  Text,
} from '@/libs/components';
import { ArrowButton } from '@/libs/components/buttons/button/arrow-button';
import { DateTimePickerModal } from '@/libs/components/calendar/date-time-picker-modal';
import { FacetOrderDropdown } from '@/libs/components/dropdowns/facet-order-dropdown/facet-order-dropdown';
import { EditableLabel } from '@/libs/components/editable-label/editable-label';
import { FilteredResultsPanel } from '@/libs/components/filtered-results-panel/filtered-results-panel';
import { EditFacetModal } from '@/libs/components/modals/edit-facet/edit-facet-modal';
import { Preview } from '@/libs/components/preview/preview';
import { TableHeading } from '@/libs/components/table/table.styles';
import { useFacetsFilter } from '@/libs/hooks';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';

import {
  AddFacetPanel,
  AttributesTable,
  Col,
  Duration,
  LabelContainer,
  LowerHeading,
  NoAttributesBlock,
  OrderArrowsContainer,
  OrderColumn,
  Row,
  ScopeWrapper,
  SectionWrapper,
} from './facets-panel.styles';
import {
  FacetDisplayType,
  FacetRowDisplayValue,
  facetsPanelReducer,
} from './facets-panel-reducer';
import { useFacetsRowsSelector } from './use-facets-panel-rows-selector';

export const COLUMNS: {
  label: string;
}[] = [
  {
    label: 'Attribute',
  },
  {
    label: 'Display name',
  },
  {
    label: 'Order',
  },
  {
    label: 'Value options',
  },
];

type defaultOrderDataType = {
  defaultOrder: string;
}[];

interface FacetsPanelProps {
  onSave: (value: {
    categoryIds: string[];
    includedFacets: ReturnedFacet[];
    excludedFacets: ExcludedFacets;
  }) => void;
  onCancel: () => void;
  setSearch?: (value: string) => void;
  onFacetDataChange?: ({
    value,
    facet,
  }: {
    value: string | 'included' | 'excluded' | 'algoControl';
    facet: ReturnedFacet;
  }) => void;
  onFacetValuesChange?: ({
    facet,
    orderedPinnedValues,
    orderedExcludedValues,
  }: {
    facet: ReturnedFacet;
    orderedPinnedValues: string[];
    orderedExcludedValues: string[];
  }) => void;
  refreshData?: () => void;
  onSelectedCategoryChange?: (
    categoryId: Required<Category> | undefined
  ) => void;
  onScheduleDateChange?: (dateTime: [Date | null, Date | null]) => void;
  displayRowOrderControls?: boolean;
  title: string;
  facetsData: ReturnedFacet[];
  facetType: 'global' | 'category' | 'search';
  isNewRuleset?: boolean;
  rulesetMerchandisingRules?: MerchandisingRules;
  categoryIds?: string[];
  endDate?: string;
  canMergeValueAttributes?: boolean;
  defaultOrderData?: defaultOrderDataType;
  initialIncludedFacets: string[];
  initialExcludedFacets: string[];
  startDate?: string;
  updatedValues?: (
    orderedPinnedValues: string[],
    orderedExcludedValues: string[],
    id: string
  ) => void;
}

export const FacetsPanel = ({
  onSave,
  onCancel,
  onFacetDataChange,
  onSelectedCategoryChange,
  onScheduleDateChange,
  refreshData,
  title,
  facetsData,
  facetType,
  isNewRuleset,
  categoryIds,
  displayRowOrderControls = false,
  endDate,
  initialIncludedFacets,
  initialExcludedFacets,
  rulesetMerchandisingRules,
  startDate,
  updatedValues,
}: FacetsPanelProps) => {
  const [selectedCategories, setSelectedCategories] = useState<Array<string>>(
    categoryIds || []
  );

  const [showPreview, setShowPreview] = useState(false);
  const [merchandisingRules] = useState<MerchandisingRules>(
    rulesetMerchandisingRules
      ? rulesetMerchandisingRules
      : {
          pinnedProducts: [],
          blockedProducts: [],
          boosts: {
            alphanumeric: [],
            numeric: [],
            product: [],
          },
          buries: {
            alphanumeric: [],
            numeric: [],
            product: [],
          },
          includes: {
            alphanumeric: [],
          },
          excludes: {
            alphanumeric: [],
          },
        }
  );

  const [selectedFacet, setSelectedFacet] = useState<ReturnedFacet | undefined>(
    undefined
  );
  const [isEditValuesModalOpen, setIsEditValuesModalOpen] = useState(false);

  const { callback: handleSearch } = useDebounce((val: string) => {
    setSearch?.(val);
  }, 300);

  const [facetPanelLocalState, dispatch] = useReducer(facetsPanelReducer, {
    includedFacets: initialIncludedFacets,
    excludedFacets: initialExcludedFacets,
  });
  const { facetsState, includedFacets, excludedFacets } = useFacetsRowsSelector(
    facetPanelLocalState,
    facetsData
  );
  const { setSearch, filteredFacets } = useFacetsFilter(facetsState);

  useEffect(() => {
    dispatch({
      type: 'INITIALIZE_STATE',
      payload: {
        includedFacets: initialIncludedFacets,
        excludedFacets: initialExcludedFacets,
      },
    });
  }, [initialIncludedFacets, initialExcludedFacets]);

  const handleOrderChange =
    (attributeState: FacetRowDisplayValue) => (newOrder: FacetDisplayType) => {
      dispatch({
        type: 'CHANGE_DISPLAY_TYPE',
        payload: {
          id: attributeState.id,
          newDisplayType: newOrder,
        },
      });
    };

  const handleMoveRowUp = (attributeState: FacetRowDisplayValue) => () => {
    dispatch({
      type: 'MOVE_INCLUDED_ROW_UP',
      payload: { id: attributeState.id },
    });
  };

  const handleMoveRowDown = (attributeState: FacetRowDisplayValue) => () => {
    dispatch({
      type: 'MOVE_INCLUDED_ROW_DOWN',
      payload: { id: attributeState.id },
    });
  };

  const onSelectCategory = (category: string) => {
    setSelectedCategories([...selectedCategories, category]);
    // TODO further refactoring needed here
    onSelectedCategoryChange?.({ identifier: category, name: '', path: '' });
  };

  const handleOpenFacetEditModal = (facet: ReturnedFacet) => {
    setIsEditValuesModalOpen(true);
    setSelectedFacet(facet);
  };

  const onClose = () => {
    setIsEditValuesModalOpen(false);
  };

  const [previewValue, setPreviewValue] = useState(
    categoryIds && categoryIds[0]
  );

  const handleSave = () => {
    onSave({
      categoryIds: selectedCategories,
      includedFacets,
      excludedFacets,
    });
  };

  const FacetRow = (facet: FacetRowDisplayValue) => {
    const { displayValue, displayType, meta } = facet;

    return (
      <Row
        optionSelected={displayType}
        data-testid="facets-table-row"
        aria-label={`Row showing ${facet.displayValue} as ${displayType}`}
        key={facet.id}
      >
        <Col>
          <Text>{facet.indexPropertyName}</Text>
        </Col>
        <Col>
          {onFacetDataChange && facetType === 'global' ? (
            <EditableLabel
              displayValue={facet.displayValue}
              onDisplayValueChange={(newValue) =>
                onFacetDataChange({ value: newValue, facet })
              }
              canCancelEdit={true}
            />
          ) : (
            <Text>{facet.displayValue}</Text>
          )}
        </Col>
        <Col>
          <OrderColumn>
            <FacetOrderDropdown
              status={displayType}
              onChange={handleOrderChange(facet)}
              hasAlgoControl
            />

            {displayType === 'included' && displayRowOrderControls && (
              <OrderArrowsContainer>
                <ArrowButton
                  direction="up"
                  aria-label={`Move ${displayValue} row up`}
                  onClick={handleMoveRowUp(facet)}
                  isDisabled={meta?.isBeginningOfDisplayTypeGroup}
                />

                <ArrowButton
                  direction="down"
                  aria-label={`Move ${displayValue} row down`}
                  onClick={handleMoveRowDown(facet)}
                  isDisabled={meta?.isEndOfDisplayTypeGroup}
                />
              </OrderArrowsContainer>
            )}
          </OrderColumn>
        </Col>
        <Col>
          {(facetType === 'global' || displayType === 'included') && (
            <Button onClick={() => handleOpenFacetEditModal(facet)}>
              Edit values
            </Button>
          )}
        </Col>
      </Row>
    );
  };

  return (
    <>
      {showPreview && selectedCategories.length && merchandisingRules && (
        <Preview
          onClose={() => setShowPreview(!showPreview)}
          categoryId={selectedCategories[0]}
          merchandisingRules={merchandisingRules}
          facetConfig={includedFacets}
          excludedFacets={excludedFacets}
        />
      )}

      <ProductGridHeader
        canSave={!!selectedCategories.length || facetType === 'global'}
        onSave={() => {
          if (selectedCategories.length > 0 || facetType === 'global') {
            handleSave();
          }
        }}
        hasPreview={!!selectedCategories.length}
        onPreview={() => setShowPreview(!showPreview)}
        isNewRuleSet={!!isNewRuleset}
        hasChanges
        onCancel={onCancel}
        shouldHidePreview={facetType === 'global'}
        title={title}
      />

      <SectionWrapper>
        <LowerHeading isStrong>Rule scope</LowerHeading>
        <ScopeWrapper>
          {facetType === 'category' && (
            <CategorySearch
              selectedCategories={selectedCategories}
              onClearSelection={(category: string) => {
                setSelectedCategories(
                  selectedCategories.filter(
                    (categoryName) => categoryName !== category
                  )
                );
                onSelectedCategoryChange?.(undefined);
              }}
              onSelectCategory={onSelectCategory}
              previewCategory={previewValue}
              selectPreviewCategory={setPreviewValue}
            />
          )}
          {facetType === 'global' && (
            <SelectedCategory label="Applies to all pages in marksandspencer.com" />
          )}
          {facetType !== 'global' && onScheduleDateChange && (
            <Duration>
              <LabelContainer>Duration</LabelContainer>
              <DateTimePickerModal
                showCalendarIcon={true}
                onUpdateDateTimeRange={onScheduleDateChange}
                dateTime={[
                  startDate ? new Date(startDate) : null,
                  endDate ? new Date(endDate) : null,
                ]}
              />
            </Duration>
          )}
        </ScopeWrapper>
      </SectionWrapper>
      <SectionWrapper>
        <AddFacetPanel>
          <div>
            <LowerHeading isStrong>Preview and manage facets</LowerHeading>
            <Text>(sort by algo control)</Text>
          </div>
        </AddFacetPanel>
      </SectionWrapper>

      {(selectedCategories.length > 0 || facetType === 'global') && (
        <SectionWrapper>
          <Search onChange={(e) => handleSearch(e.target.value)} />
        </SectionWrapper>
      )}

      <AttributesTable>
        <Row>
          {COLUMNS.map(({ label }) => (
            <Col key={`column-${label}`}>
              <TableHeading as="p" isStrong={true}>
                {label}
              </TableHeading>
            </Col>
          ))}
        </Row>

        {filteredFacets.map(FacetRow)}
      </AttributesTable>

      {isEditValuesModalOpen && selectedFacet && (
        <EditFacetModal
          onClose={onClose}
          facet={selectedFacet}
          facetType={facetType}
          refreshData={refreshData}
          updatedValues={updatedValues}
          category={
            facetType === 'category' ? selectedCategories[0] : undefined
          }
        />
      )}

      {filteredFacets.length === 0 && (
        <NoAttributesBlock>
          <Text>No, there are no attributes yet.</Text>
          <Text>How about adding a subcategory first?</Text>
        </NoAttributesBlock>
      )}

      <FilteredResultsPanel filteredFacets={filteredFacets.length} />
    </>
  );
};
