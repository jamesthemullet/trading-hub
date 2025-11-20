import { useMemo, useState } from 'react';
import { Modal } from '@mantine/core';
import { useRouter } from 'next/router';

import type {
  MerchandisingCountryCode,
  MerchandisingExcludedFacets,
  MerchandisingReturnedFacet,
} from '@/libs/api';
import { Button, CombinedDropdown, Search, Text } from '@/libs/components';
import { ArrowButton } from '@/libs/components/arrow-button/arrow-button';
import {
  AttributesTable,
  Col,
  CountrySelectorLabel,
  LowerHeading,
  NoAttributesBlock,
  OrderArrowsContainer,
  OrderColumn,
  Row,
  ScopeWrapper,
  SearchWrapper,
  SectionWrapper,
} from '@/libs/components/facets-panel/facets-panel.styles';
import { useShowNewFacetValuesPage } from '@/libs/components/feature-flag/feature-flag';
import { FilteredResultsPanel } from '@/libs/components/filtered-results-panel/filtered-results-panel';
import { InfoBox } from '@/libs/components/infoBox/info-box';
import { COLUMNS, ROUTES } from '@/libs/constants';
import { FacetsPanelAccordion } from '@/libs/containers/facets/facets-panel-accordion/facets-panel-accordion';
import { EditableLabel } from '@/libs/containers/shared/editable-label/editable-label';
import { ProductGridHeader } from '@/libs/containers/shared/product-grid-header/product-grid-header';
import { TableHeading } from '@/libs/containers/shared/table/table.styles';
import { useFacetsFilter } from '@/libs/hooks';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';
import type {
  Action,
  FacetDisplayType,
  FacetRowDisplayValue,
} from '@/libs/stores/facets-panel/facets-panel-reducer';

import { GlobalFacetPanelModal } from '../global-facets-panel-modal/global-facets-panel-modal';

type defaultOrderDataType = {
  defaultOrder: string;
}[];

interface FacetsPanelProps {
  displayRowOrderControls?: boolean;
  title: string;
  canMergeValueAttributes?: boolean;
  defaultOrderData?: defaultOrderDataType;
  facetsState: FacetRowDisplayValue[];
  countryCode: MerchandisingCountryCode;
  includedFacets: MerchandisingReturnedFacet[];
  excludedFacets: MerchandisingExcludedFacets;
  selectedPreviewCountryCode?: 'UK' | 'IE';
  writeEnabled: boolean;
  dispatch: (action: Action) => void;
  onSave: () => void;
  onCancel: () => void;
  onFacetDataChange: ({
    value,
    facet,
  }: {
    value: string | 'included' | 'excluded' | 'algoControl';
    facet: MerchandisingReturnedFacet;
  }) => void;
  refreshData: () => void;
}

export const FacetsPanel = ({
  displayRowOrderControls = false,
  title,
  facetsState,
  countryCode,
  writeEnabled,
  dispatch,
  onSave,
  onCancel,
  onFacetDataChange,
  refreshData,
}: FacetsPanelProps) => {
  const router = useRouter();
  const showNewFacetValuesPage = useShowNewFacetValuesPage();

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
          {writeEnabled ? (
            <EditableLabel
              displayValue={displayValue}
              onCancel={() => setError(id, '')}
              onDisplayValueChange={(newValue) =>
                onFacetDataChange({ value: newValue, facet })
              }
              canCancelEdit
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
            <CombinedDropdown
              variant="facetOrder"
              status={displayType}
              onChange={(newOrder) =>
                handleOrderChange(facet)(newOrder as FacetDisplayType)
              }
              hasAlgoControl
              writeEnabled={writeEnabled}
              ariaLabel="Select to set as included, excluded or algo control"
            />

            {displayType === 'included' &&
              displayRowOrderControls &&
              writeEnabled && (
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
          {showNewFacetValuesPage ? (
            <Button
              as="a"
              theme="secondary"
              href={(() => {
                const ruleSetId = router.query.id as string;
                const baseUrl = ROUTES.GLOBAL.FACETS.VALUES.EDIT(facet.id);
                const params = new URLSearchParams({
                  ruleSetId,
                  displayName: facet.displayValue,
                  countryCode,
                });
                return `${baseUrl}?${params.toString()}`;
              })()}
              disabled={!writeEnabled}
            >
              Edit values
            </Button>
          ) : (
            <Button
              onClick={() => handleOpenFacetEditModal(facet)}
              disabled={!writeEnabled}
            >
              Edit values
            </Button>
          )}
        </Col>
      </Row>
    );
  };

  const [boostedCount, excludedCount, nonBoostedExcludedCount] = useMemo(() => {
    const boosted = facetsState.filter(
      (facet) => facet.displayType === 'included'
    ).length;
    const excluded = facetsState.filter(
      (facet) => facet.displayType === 'excluded'
    ).length;
    const nonBoostedExcluded = facetsState.filter(
      (facet) => facet.displayType === 'algoControl'
    ).length;

    return [boosted, excluded, nonBoostedExcluded];
  }, [facetsState]);

  return (
    <>
      <ProductGridHeader
        canSave
        onSave={() => onSave()}
        hasPreview={false}
        isNewRuleSet={false}
        hasChanges
        onCancel={onCancel}
        shouldHidePreview
        title={title}
        writeEnabled={writeEnabled}
        rulesetType="global"
      />

      <SectionWrapper>
        <LowerHeading isStrong>Rule scope</LowerHeading>
        <ScopeWrapper>
          <div>
            <CountrySelectorLabel>Influence</CountrySelectorLabel>
            <CombinedDropdown
              variant="countrySelector"
              onChange={(country) => {
                dispatch({
                  type: 'changeCountry',
                  payload: country as MerchandisingCountryCode,
                });
              }}
              selectedCountryCode={countryCode}
              writeEnabled={writeEnabled}
              ariaLabel="Select country"
            />
          </div>

          <InfoBox text="You are currently editing all pages on the M&S website and app" />
        </ScopeWrapper>

        <FacetsPanelAccordion
          boostedCount={boostedCount}
          excludedCount={excludedCount}
          nonBoostedExcludedCount={nonBoostedExcludedCount}
        />
      </SectionWrapper>

      <SectionWrapper>
        <SearchWrapper>
          <Search
            onChange={(e) => handleSearch(e.target.value.trim())}
            placeholder="Search"
          />
        </SearchWrapper>
      </SectionWrapper>

      <AttributesTable>
        <Row>
          {COLUMNS.map(({ label }) => (
            <Col key={`column-${label}`}>
              <TableHeading as="p" isStrong>
                {label}
              </TableHeading>
            </Col>
          ))}
        </Row>

        {filteredFacets.map(FacetRow)}
      </AttributesTable>

      {selectedFacet && isEditValuesModalOpen && (
        <Modal.Root
          opened
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
                onClose={(shouldRefetch) => {
                  // istanbul ignore else
                  if (refreshData && shouldRefetch) refreshData();
                  onClose();
                }}
                writeEnabled={writeEnabled}
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
