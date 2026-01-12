import { useMemo, useState } from 'react';
import { Modal } from '@mantine/core';
import { useRouter } from 'next/router';

import type {
  MerchandisingCountryCode,
  MerchandisingExcludedFacets,
  MerchandisingReturnedFacet,
} from '@/libs/api';
import {
  ButtonDeprecated,
  CombinedDropdown,
  Search,
  Text,
  Typography,
} from '@/libs/components';
import { DragHandleButton } from '@/libs/components/edit-facet-modal-content/edit-facet-modal-content.styles';
import { useShowNewFacetValuesPage } from '@/libs/components/feature-flag/feature-flag';
import { FilteredResultsPanel } from '@/libs/components/filtered-results-panel/filtered-results-panel';
import { InfoBox } from '@/libs/components/infoBox/info-box';
import { COLUMNS, ROUTES } from '@/libs/constants';
import { FacetsPanelAccordion } from '@/libs/containers/facets/facets-panel-accordion/facets-panel-accordion';
import type { SortableRowRenderArgs } from '@/libs/containers/facets/sortable-row/sortable-row';
import { SortableRow } from '@/libs/containers/facets/sortable-row/sortable-row';
import { EditableLabel } from '@/libs/containers/shared/editable-label/editable-label';
import { ProductGridHeader } from '@/libs/containers/shared/product-grid-header/product-grid-header';
import {
  AttributesTable,
  Col,
  LowerHeading,
  NoAttributesBlock,
  OrderColumn,
  Row,
  ScopeWrapper,
  SearchWrapper,
  SectionWrapper,
} from '@/libs/features/facets/facets-panel/facets-panel.styles';
import { createBoostedDragEndHandler } from '@/libs/features/facets/utils/create-boosted-drag-end-handler';
import { useFacetsFilter } from '@/libs/hooks';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';
import type {
  Action,
  FacetDisplayType,
  FacetRowDisplayValue,
} from '@/libs/stores/facets-panel/facets-panel-reducer';

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import Image from 'next/image';

import { GlobalFacetPanelModal } from '../global-facets-panel-modal/global-facets-panel-modal';
import styles from './facets-panel.module.css';

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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const includedFacetOrder = useMemo(
    () =>
      facetsState
        .filter((facet) => facet.displayType === 'included')
        .map((facet) => facet.id),
    [facetsState]
  );

  const { setSearch, filteredFacets } = useFacetsFilter(facetsState);

  const visibleIncludedFacetIds = useMemo(
    () =>
      filteredFacets
        .filter((facet) => facet.displayType === 'included')
        .map((facet) => facet.id),
    [filteredFacets]
  );

  const { callback: handleSearch } = useDebounce((val: string) => {
    setSearch?.(val);
  }, 300);

  const handleIncludedDragEnd = useMemo(
    () =>
      createBoostedDragEndHandler({
        boostedOrder: includedFacetOrder,
        dispatch: (action) =>
          dispatch({
            type: 'SET_INCLUDED_ORDER',
            payload: action.payload,
          }),
        writeEnabled: writeEnabled && displayRowOrderControls,
      }),
    [dispatch, displayRowOrderControls, includedFacetOrder, writeEnabled]
  );

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

  const disallowedValues = facetsState.map((facet) => facet.displayValue);

  const FacetRow = (facet: FacetRowDisplayValue) => {
    const { displayValue, displayType, id } = facet;
    const errorState = errorStates[id] || { message: '' };
    const isIncludedFacet = displayType === 'included';
    const isDragDisabled = !writeEnabled || boostedCount <= 1;

    const renderRow = (sortableProps?: SortableRowRenderArgs) => (
      <Row
        optionSelected={displayType}
        data-testid={`Row showing ${facet.displayValue} as ${displayType}`}
        key={sortableProps ? undefined : id}
        ref={sortableProps?.setNodeRef}
        style={sortableProps?.style}
        {...(sortableProps?.attributes ?? {})}
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
              writeEnabled={writeEnabled}
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
          </OrderColumn>
        </Col>

        <Col>
          {showNewFacetValuesPage ? (
            <ButtonDeprecated
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
              {writeEnabled ? 'Edit values' : 'View values'}
            </ButtonDeprecated>
          ) : (
            <ButtonDeprecated
              onClick={() => handleOpenFacetEditModal(facet)}
              disabled={!writeEnabled}
            >
              Edit values
            </ButtonDeprecated>
          )}
        </Col>

        <Col>
          {isIncludedFacet && (
            <DragHandleButton
              type="button"
              aria-label={`Reorder ${displayValue}`}
              ref={sortableProps?.setActivatorNodeRef}
              {...(sortableProps?.listeners ?? {})}
              disabled={isDragDisabled}
              aria-disabled={isDragDisabled}
              data-testid={`drag-handle-${displayValue}`}
            >
              <Image
                width={24}
                height={24}
                src="/trading-hub/asset/drag-handle.svg"
                alt="Drag handle"
              />
            </DragHandleButton>
          )}
        </Col>
      </Row>
    );

    if (isIncludedFacet) {
      return (
        <SortableRow key={id} id={id} disabled={!writeEnabled}>
          {(sortableProps) => renderRow(sortableProps)}
        </SortableRow>
      );
    }

    return renderRow();
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

  const includedFacets = filteredFacets.filter(
    (facet) => facet.displayType === 'included'
  );
  const nonIncludedFacets = filteredFacets.filter(
    (facet) => facet.displayType !== 'included'
  );

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
        <div className={styles.lowerHeading}>
          <LowerHeading isStrong>Rule scope</LowerHeading>
        </div>
        <ScopeWrapper>
          <div>
            <Typography variant="bodySmall" withMargin>
              Influence
            </Typography>
            <CombinedDropdown
              variant="countrySelector"
              onChange={(country) => {
                dispatch({
                  type: 'changeCountry',
                  payload: country as MerchandisingCountryCode,
                });
              }}
              selectedCountryCode={countryCode}
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
              <Typography isStrong variant="bodySmall">
                {label}
              </Typography>
            </Col>
          ))}
        </Row>

        <DndContext sensors={sensors} onDragEnd={handleIncludedDragEnd}>
          <SortableContext
            items={visibleIncludedFacetIds}
            strategy={verticalListSortingStrategy}
          >
            {includedFacets.map(FacetRow)}
          </SortableContext>
        </DndContext>

        {nonIncludedFacets.map(FacetRow)}
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
