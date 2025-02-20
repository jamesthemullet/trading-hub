import { useState } from 'react';

import {
  CountryCode,
  ExcludedFacets,
  MerchandisingRules,
  ReturnedFacet,
} from '@/libs/api';
import {
  Button,
  CategorySearch,
  ErrorMessage,
  ProductGridHeader,
  Search,
  SearchKeywords,
  SelectedCategory,
  Text,
} from '@/libs/components';
import { ArrowButton } from '@/libs/components/buttons/button/arrow-button';
import { DateTimePickerModal } from '@/libs/components/calendar/date-time-picker-modal';
import { CountrySelectorDropdown } from '@/libs/components/dropdowns/country-selector/country-selector';
import { FacetOrderDropdown } from '@/libs/components/dropdowns/facet-order-dropdown/facet-order-dropdown';
import { EditableLabel } from '@/libs/components/editable-label/editable-label';
import { FilteredResultsPanel } from '@/libs/components/filtered-results-panel/filtered-results-panel';
import { EditFacetModal } from '@/libs/components/modals/edit-facet/edit-facet-modal';
import { Preview } from '@/libs/components/preview/preview';
import { TableHeading } from '@/libs/components/table/table.styles';
import { checkForDuplicates } from '@/libs/components/utils/check-for-duplicates';
import { useFacetsFilter } from '@/libs/hooks';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';

import {
  AddFacetPanel,
  AttributesTable,
  Col,
  CountrySelectorLabel,
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
  Action,
  FacetDisplayType,
  FacetRowDisplayValue,
} from './facets-panel-reducer';

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
  displayRowOrderControls?: boolean;
  title: string;
  facetType: 'global' | 'category' | 'search';
  isNewRuleset?: boolean;
  rulesetMerchandisingRules?: MerchandisingRules;
  endDate?: string;
  canMergeValueAttributes?: boolean;
  defaultOrderData?: defaultOrderDataType;
  startDate?: string;
  facetsState: FacetRowDisplayValue[];
  selectedCategories?: string[];
  searchTerms?: string[];
  countryCode: CountryCode;
  includedFacets: ReturnedFacet[];
  excludedFacets: ExcludedFacets;
  selectedPreviewCountryCode?: 'UK' | 'IE';
  writeEnabled?: boolean;
  dispatch: (action: Action) => void;
  onSave: () => void;
  onCancel: () => void;
  onFacetDataChange?: ({
    value,
    facet,
  }: {
    value: string | 'included' | 'excluded' | 'algoControl';
    facet: ReturnedFacet;
  }) => void;
  setDateTime?: (dateTime: [Date | null, Date | null]) => void;
  updatedValues?: (
    orderedPinnedValues: string[],
    orderedExcludedValues: string[],
    id: string
  ) => void;
  setSelectedCategories?: (category: string[]) => void;
  setSelectedPreviewCountryCode?: (countryCode: 'UK' | 'IE') => void;
  setSearchTerms?: (searchTerms: string[]) => void;
  refreshData?: () => void;
}

export const FacetsPanel = ({
  displayRowOrderControls = false,
  selectedCategories = [],
  searchTerms = [],
  title,
  facetType,
  isNewRuleset,
  endDate,
  rulesetMerchandisingRules,
  startDate,
  facetsState,
  countryCode,
  includedFacets,
  excludedFacets,
  selectedPreviewCountryCode,
  writeEnabled,
  dispatch,
  onSave,
  onCancel,
  onFacetDataChange,
  setDateTime,
  updatedValues,
  setSelectedCategories,
  setSelectedPreviewCountryCode,
  setSearchTerms,
  refreshData,
}: FacetsPanelProps) => {
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
  const [duplicationError, setDuplicationError] = useState('');

  const [previewValue, setPreviewValue] = useState<string | undefined>(
    (selectedCategories && selectedCategories[0]) ||
      (searchTerms && searchTerms[0])
  );

  const { setSearch, filteredFacets } = useFacetsFilter(facetsState);

  const { callback: handleSearch } = useDebounce((val: string) => {
    setSearch?.(val);
  }, 300);

  const onClose = () => {
    setIsEditValuesModalOpen(false);
  };

  const handleOpenFacetEditModal = (facet: ReturnedFacet) => {
    setIsEditValuesModalOpen(true);
    setSelectedFacet(facet);
  };

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

  const onClearSelection = (category: string) => {
    setSelectedCategories?.(
      selectedCategories.filter((categoryName) => categoryName !== category)
    );
  };

  const onSelectCategory = (category: string) => {
    const hasDuplicates = checkForDuplicates(
      [...selectedCategories],
      category,
      'ruleset'
    );

    if (hasDuplicates) {
      setDuplicationError(hasDuplicates);
    } else {
      setSelectedCategories?.([...selectedCategories, category]);
      setSelectedPreviewCountryCode?.(category.includes('IE_') ? 'IE' : 'UK');
    }
  };

  const onRemoveSearchTerm = (term: string) => {
    setSearchTerms?.(searchTerms.filter((searchTerm) => searchTerm !== term));
  };

  const onAddSearchTerm = (term: string) => {
    const hasDuplicates = checkForDuplicates(searchTerms, term, 'keyword');

    if (hasDuplicates) {
      setDuplicationError(hasDuplicates);
    } else {
      setSearchTerms?.([...searchTerms, term]);
      setPreviewValue(term);
      setDuplicationError('');
    }
  };

  const onSelectPreviewCategory = (category: string | undefined) => {
    setPreviewValue(category);
    setSelectedPreviewCountryCode?.(category?.includes('IE_') ? 'IE' : 'UK');
  };

  const FacetRow = (facet: FacetRowDisplayValue) => {
    const { displayValue, displayType, meta } = facet;

    return (
      <Row
        optionSelected={displayType}
        data-testid={`Row showing ${facet.displayValue} as ${displayType}`}
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
      {showPreview && (
        <Preview
          onClose={() => setShowPreview(!showPreview)}
          categoryId={facetType === 'category' ? previewValue : undefined}
          searchTerm={facetType === 'search' ? previewValue : undefined}
          merchandisingRules={merchandisingRules}
          facetConfig={includedFacets}
          excludedFacets={excludedFacets}
          countryCode={selectedPreviewCountryCode || 'UK'}
        />
      )}

      <ProductGridHeader
        canSave={
          (writeEnabled && !!selectedCategories.length) ||
          !!searchTerms.length ||
          facetType === 'global'
        }
        onSave={() => {
          if (
            selectedCategories.length > 0 ||
            searchTerms.length > 0 ||
            facetType === 'global'
          ) {
            onSave();
          }
        }}
        hasPreview={!!selectedCategories.length || !!searchTerms.length}
        onPreview={() => setShowPreview(!showPreview)}
        isNewRuleSet={!!isNewRuleset}
        hasChanges
        onCancel={onCancel}
        shouldHidePreview={facetType === 'global'}
        title={title}
        writeEnabled={writeEnabled}
      />

      <SectionWrapper>
        <LowerHeading isStrong>Rule scope</LowerHeading>
        <ScopeWrapper>
          <div>
            <CountrySelectorLabel>Influence</CountrySelectorLabel>
            <CountrySelectorDropdown
              onChange={(country) => {
                dispatch({ type: 'changeCountry', payload: country });
              }}
              selectedCountryCode={countryCode}
            />
          </div>
          {facetType === 'category' && (
            <CategorySearch
              selectedCategories={selectedCategories}
              countryCode={countryCode}
              previewCategory={previewValue}
              onClearSelection={onClearSelection}
              onSelectCategory={onSelectCategory}
              selectPreviewCategory={onSelectPreviewCategory}
              error={duplicationError}
            />
          )}
          {facetType === 'global' && (
            <SelectedCategory label="Applies to all pages in marksandspencer.com" />
          )}
          {facetType === 'search' && (
            <SearchKeywords
              title="Search Keywords"
              searchTerms={searchTerms}
              addSearchTerm={onAddSearchTerm}
              removeSearchTerm={onRemoveSearchTerm}
              previewSearchTerm={previewValue}
              selectPreviewSearchTerm={setPreviewValue}
              error={duplicationError}
            />
          )}
          {facetType !== 'global' && setDateTime && (
            <Duration>
              <LabelContainer>Duration</LabelContainer>
              <DateTimePickerModal
                showCalendarIcon={true}
                onUpdateDateTimeRange={setDateTime}
                dateTime={[
                  startDate ? new Date(startDate) : null,
                  endDate ? new Date(endDate) : null,
                ]}
              />
            </Duration>
          )}
        </ScopeWrapper>
        {duplicationError && (
          <ErrorMessage style={{ padding: 0 }}>{duplicationError}</ErrorMessage>
        )}
      </SectionWrapper>
      <SectionWrapper>
        <AddFacetPanel>
          <div>
            <LowerHeading isStrong>Preview and manage facets</LowerHeading>
            <Text>(sort by algo control)</Text>
          </div>
        </AddFacetPanel>
      </SectionWrapper>

      {(selectedCategories.length > 0 ||
        searchTerms.length > 0 ||
        facetType === 'global') && (
        <SectionWrapper>
          <Search onChange={(e) => handleSearch(e.target.value.trim())} />
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
