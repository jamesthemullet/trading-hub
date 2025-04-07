import { useState } from 'react';
import { Modal } from '@mantine/core';

import type {
  CountryCode,
  ExcludedFacets,
  MerchandisingRules,
  ReturnedFacet,
} from '@/libs/api';
import {
  Button,
  CategorySearch,
  DropdownContent,
  DropdownItem,
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

import Image from 'next/image';

import {
  AttributesTable,
  Col,
  CountryPreviewDropdown,
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
import type {
  Action,
  FacetDisplayType,
  FacetRowDisplayValue,
} from './facets-panel-reducer';
import { GlobalFacetPanelModal } from './global-facets-panel-modal';

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
  selectedCategoriesInfo?: Array<{
    id?: string;
    name?: string;
    plpUrl?: string;
  }>;
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
  setSelectedCategoriesInfo?: (
    category: {
      id?: string;
      name?: string;
      plpUrl?: string;
    }[]
  ) => void;
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
  selectedCategoriesInfo,
  dispatch,
  onSave,
  onCancel,
  onFacetDataChange,
  setDateTime,
  updatedValues,
  setSelectedCategories,
  setSelectedCategoriesInfo,
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
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

  const [previewValue, setPreviewValue] = useState<string | undefined>(
    selectedCategories?.[0] || searchTerms?.[0]
  );

  const [errorStates, setErrorStates] = useState<
    Record<string, { message: string }>
  >({});

  const setError = (id: string, message: string) => {
    setErrorStates((prev) => ({
      ...Object.fromEntries(Object.entries(prev).filter(([key]) => key !== id)),
      ...(message && { [id]: { message } }),
    }));
  };

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

    if (selectedCategoriesInfo && setSelectedCategoriesInfo) {
      setSelectedCategoriesInfo(
        selectedCategoriesInfo?.filter(
          (categoriesInfo) => categoriesInfo.id !== category
        )
      );
    }
  };

  const onSelectCategory = (category: {
    identifier: string;
    name: string;
    path: string;
  }) => {
    const hasDuplicates = checkForDuplicates(
      [...selectedCategories],
      category.identifier,
      'ruleset'
    );

    if (hasDuplicates) {
      setDuplicationError(hasDuplicates);
    } else {
      setSelectedCategories?.([...selectedCategories, category.identifier]);
      if (selectedCategoriesInfo && setSelectedCategoriesInfo) {
        setSelectedCategoriesInfo([
          ...selectedCategoriesInfo,
          {
            id: category.identifier,
            name: category.name,
            plpUrl: category.path,
          },
        ]);
      }
      setSelectedPreviewCountryCode?.(
        category.identifier.includes('IE_') ? 'IE' : 'UK'
      );
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

  const disallowedValues = facetsState.map((facet) => facet.displayValue);

  const FacetRow = (facet: FacetRowDisplayValue) => {
    const { displayValue, displayType, meta, id } = facet;
    const errorState = errorStates[id] || { message: '' };

    return (
      <Row
        optionSelected={displayType}
        data-testid={`Row showing ${facet.displayValue} as ${displayType}`}
        key={id}
      >
        <Col>
          <Text>{facet.indexPropertyName}</Text>
        </Col>
        <Col>
          {onFacetDataChange && facetType === 'global' ? (
            <EditableLabel
              displayValue={displayValue}
              onCancel={() => setError(id, '')}
              onDisplayValueChange={(newValue) =>
                onFacetDataChange({ value: newValue, facet })
              }
              canCancelEdit={true}
              showErrorState={!!errorState.message}
              setError={(message) => setError(id, message)}
              disallowedValues={facetsState.map((facet) => facet.displayValue)}
              disallowedErrorMessage={errorState.message}
              handleUpdatedValue={(event) => {
                event.stopPropagation();
                if (event.target.value === '') {
                  setError(id, 'You must supply a value');
                } else if (disallowedValues?.includes(event.target.value)) {
                  setError(id, `${event.target.value} is not a unique value`);
                } else {
                  setError(id, '');
                }
              }}
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
          previewTitle={previewValue}
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
                if (country !== 'UK_IE')
                  setSelectedPreviewCountryCode?.(country);
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
              selectedCategoriesInfo={selectedCategoriesInfo}
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

          {facetType === 'search' && countryCode === 'UK_IE' && (
            <div>
              <CountrySelectorLabel>Preview Country</CountrySelectorLabel>
              <CountryPreviewDropdown
                label={`${selectedPreviewCountryCode} view`}
                isOpen={isCountryDropdownOpen}
                icon={`icon-${selectedPreviewCountryCode?.toLowerCase()}-flag`}
                onOpen={() => {
                  setIsCountryDropdownOpen(true);
                }}
                onClose={() => {
                  setIsCountryDropdownOpen(false);
                }}
                aria-label="Select country for preview"
              >
                <DropdownContent isLeftAligned>
                  <DropdownItem
                    as="button"
                    onClick={() => {
                      setSelectedPreviewCountryCode?.('IE');
                      setIsCountryDropdownOpen(false);
                    }}
                  >
                    <Image
                      src="/trading-hub/asset/icon-ie-flag.svg"
                      width={20}
                      height={20}
                      alt="IE flag"
                    />
                    &nbsp; IE view
                  </DropdownItem>
                  <DropdownItem
                    as="button"
                    onClick={() => {
                      setSelectedPreviewCountryCode?.('UK');
                      setIsCountryDropdownOpen(false);
                    }}
                  >
                    <Image
                      src="/trading-hub/asset/icon-uk-flag.svg"
                      width={20}
                      height={20}
                      alt="UK flag"
                    />
                    &nbsp; UK view
                  </DropdownItem>
                </DropdownContent>
              </CountryPreviewDropdown>
            </div>
          )}
        </ScopeWrapper>
        {duplicationError && (
          <ErrorMessage style={{ padding: 0 }}>{duplicationError}</ErrorMessage>
        )}
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

      {facetType === 'global' && selectedFacet && isEditValuesModalOpen && (
        <Modal.Root
          opened={true}
          onClose={onClose}
          centered
          size={1150}
          padding={0}
          role="dialog"
          aria-modal="true"
          aria-label="Edit facet values modal"
        >
          <Modal.Overlay blur={3} />
          <Modal.Content>
            <Modal.Body>
              <GlobalFacetPanelModal
                countryCode={countryCode}
                facet={selectedFacet}
                onClose={() => {
                  if (refreshData) refreshData();
                  onClose();
                }}
              />
            </Modal.Body>
          </Modal.Content>
        </Modal.Root>
      )}

      {facetType !== 'global' && isEditValuesModalOpen && selectedFacet && (
        <EditFacetModal
          onClose={onClose}
          mergeEnabled={false}
          removeFacetValueFromMergeGroupEnabled={false}
          displayValueEditEnabled={false}
          saveButtonLabel="Done"
          onSave={async (facet) => {
            // istanbul ignore next - for undefined value
            const facetBoosted = facet.boosted ?? [];
            // istanbul ignore next - for undefined value
            const facetExcludedValues = facet.excludedValues ?? [];

            updatedValues?.(facetBoosted, facetExcludedValues, facet.id);
            onClose();
          }}
          facet={selectedFacet}
          categories={facetType === 'category' ? selectedCategories : undefined}
          countryCode={countryCode}
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
