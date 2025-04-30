import { useState } from 'react';
import { Modal } from '@mantine/core';

import type {
  MerchandisingCountryCode,
  MerchandisingExcludedFacets,
  MerchandisingReturnedFacet,
  MerchandisingRules,
} from '@/libs/api';
import {
  Button,
  ProductGridHeader,
  Search,
  SelectedCategory,
  Text,
} from '@/libs/components';
import { ArrowButton } from '@/libs/components/buttons/button/arrow-button';
import { DateTimePickerModal } from '@/libs/components/calendar/date-time-picker-modal';
import { CountrySelectorDropdown } from '@/libs/components/dropdowns/country-selector/country-selector';
import { FacetOrderDropdown } from '@/libs/components/dropdowns/facet-order-dropdown/facet-order-dropdown';
import { EditableLabel } from '@/libs/components/editable-label/editable-label';
import { FilteredResultsPanel } from '@/libs/components/filtered-results-panel/filtered-results-panel';
import { GlobalFacetPanelModal } from '@/libs/components/modals/facet-panel/global/global-facets-panel-modal';
import { TableHeading } from '@/libs/components/table/table.styles';
import { useFacetsFilter } from '@/libs/hooks';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';

import {
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
import type {
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
  countryCode: MerchandisingCountryCode;
  includedFacets: MerchandisingReturnedFacet[];
  excludedFacets: MerchandisingExcludedFacets;
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
    facet: MerchandisingReturnedFacet;
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
  title,
  facetType,
  isNewRuleset,
  endDate,
  startDate,
  facetsState,
  countryCode,
  writeEnabled,
  dispatch,
  onSave,
  onCancel,
  onFacetDataChange,
  setDateTime,
  refreshData,
}: FacetsPanelProps) => {
  const [selectedFacet, setSelectedFacet] = useState<
    MerchandisingReturnedFacet | undefined
  >(undefined);

  const [isEditValuesModalOpen, setIsEditValuesModalOpen] = useState(false);

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

  const handleOpenFacetEditModal = (facet: MerchandisingReturnedFacet) => {
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
      <ProductGridHeader
        canSave={true}
        onSave={() => {
          if (facetType === 'global') {
            onSave();
          }
        }}
        hasPreview={false}
        isNewRuleSet={!!isNewRuleset}
        hasChanges
        onCancel={onCancel}
        shouldHidePreview={facetType === 'global'}
        title={title}
        writeEnabled={writeEnabled}
        rulesetType={facetType}
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

          {facetType === 'global' && (
            <SelectedCategory label="Applies to all pages in marksandspencer.com" />
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
      </SectionWrapper>

      {facetType === 'global' && (
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
