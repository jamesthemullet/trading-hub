import { useCallback, useMemo, useState } from 'react';
import { Modal } from '@mantine/core';
import { useRouter } from 'next/router';

import type {
  MerchandisingCountryCode,
  MerchandisingReturnedFacet,
} from '@/libs/api';
import { CombinedDropdown, Search, Typography } from '@/libs/components';
import { useShowNewFacetValuesPage } from '@/libs/components/feature-flag/feature-flag';
import { FilteredResultsPanel } from '@/libs/components/filtered-results-panel/filtered-results-panel';
import { InfoBox } from '@/libs/components/infoBox/info-box';
import { COLUMNS } from '@/libs/constants';
import { FacetsPanelAccordion } from '@/libs/containers/facets/facets-panel-accordion/facets-panel-accordion';
import { ProductGridHeader } from '@/libs/containers/shared/product-grid-header/product-grid-header';
import { createBoostedDragEndHandler } from '@/libs/features/facets/utils/create-boosted-drag-end-handler';
import { useFacetsFilter } from '@/libs/hooks';
import { useFacetOrderInput } from '@/libs/hooks/use-facet-order-input';
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

import { GlobalFacetPanelModal } from '../global-facets-panel-modal/global-facets-panel-modal';
import { FacetRow } from './facet-row';
import styles from './facets-panel.module.css';

type FacetsPanelProps = {
  displayRowOrderControls?: boolean;
  title: string;
  facetsState: FacetRowDisplayValue[];
  countryCode: MerchandisingCountryCode;
  includedFacets: MerchandisingReturnedFacet[];
  writeEnabled: boolean;
  orders: Record<string, number>;
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
};

export const FacetsPanel = ({
  title,
  facetsState,
  countryCode,
  writeEnabled,
  orders,
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

  const setError = useCallback((id: string, message: string) => {
    setErrorStates((prev) => ({
      ...Object.fromEntries(Object.entries(prev).filter(([key]) => key !== id)),
      ...(message && { [id]: { message } }),
    }));
  }, []);

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
        writeEnabled,
      }),
    [dispatch, includedFacetOrder, writeEnabled]
  );

  const onClose = () => {
    setIsEditValuesModalOpen(false);
  };

  const handleDisplayTypeChange = useCallback(
    (id: string, newDisplayType: FacetDisplayType) => {
      dispatch({
        type: 'CHANGE_DISPLAY_TYPE',
        payload: { id, newDisplayType },
      });
    },
    [dispatch]
  );

  const disallowedValues = useMemo(
    () => facetsState.map((facet) => facet.displayValue),
    [facetsState]
  );

  const handleOpenFacetEditModal = useCallback(
    (facet: MerchandisingReturnedFacet) => {
      setIsEditValuesModalOpen(true);
      setSelectedFacet(facet);
    },
    []
  );

  const handleOrderChangeCallback = useCallback(
    (id: string, newIndex: number) => {
      dispatch({
        type: 'SET_INCLUDED_ORDER',
        payload: { id, newIndex },
      });
    },
    [dispatch]
  );

  const {
    getInputRef,
    localOrders,
    handleInputChange,
    handleInputBlur,
    handleInputKeyDown,
  } = useFacetOrderInput(handleOrderChangeCallback, orders);

  const ruleSetId = router.query.id as string;

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

  const renderFacetRow = useCallback(
    (facet: FacetRowDisplayValue) => {
      const { id } = facet;
      const errorMessage = errorStates[id]?.message ?? '';
      const order = orders[id] ?? includedFacetOrder.indexOf(id) + 1;
      const localOrder = localOrders[id] ?? order;

      return (
        <FacetRow
          key={id}
          facet={facet}
          errorMessage={errorMessage}
          writeEnabled={writeEnabled}
          boostedCount={boostedCount}
          order={order}
          localOrder={localOrder}
          disallowedValues={disallowedValues}
          showNewFacetValuesPage={showNewFacetValuesPage}
          countryCode={countryCode}
          ruleSetId={ruleSetId}
          setError={setError}
          onFacetDataChange={onFacetDataChange}
          onDisplayTypeChange={handleDisplayTypeChange}
          onOpenFacetEditModal={handleOpenFacetEditModal}
          getInputRef={getInputRef}
          handleInputChange={handleInputChange}
          handleInputBlur={handleInputBlur}
          handleInputKeyDown={handleInputKeyDown}
        />
      );
    },
    [
      errorStates,
      orders,
      includedFacetOrder,
      localOrders,
      writeEnabled,
      boostedCount,
      disallowedValues,
      showNewFacetValuesPage,
      countryCode,
      ruleSetId,
      setError,
      onFacetDataChange,
      handleDisplayTypeChange,
      handleOpenFacetEditModal,
      getInputRef,
      handleInputChange,
      handleInputBlur,
      handleInputKeyDown,
    ]
  );

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

      <div className={styles.sectionWrapper}>
        <div className={styles.lowerHeading}>
          <Typography variant="bodyMedium" isStrong withMargin>
            Rule scope
          </Typography>
        </div>
        <div className={styles.scopeWrapper}>
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
        </div>

        <FacetsPanelAccordion
          boostedCount={boostedCount}
          excludedCount={excludedCount}
          nonBoostedExcludedCount={nonBoostedExcludedCount}
        />
      </div>

      <div className={styles.sectionWrapper}>
        <div className={styles.searchWrapper}>
          <Search
            onChange={(e) => handleSearch(e.target.value.trim())}
            placeholder="Search"
          />
        </div>
      </div>

      <div className={styles.attributesTable}>
        <div className={styles.facetTableRow} data-with-reorder>
          {COLUMNS.map(({ label }) => (
            <div key={`column-${label}`} className={styles.tableCol}>
              <Typography isStrong variant="bodySmall">
                {label}
              </Typography>
            </div>
          ))}
        </div>

        <DndContext sensors={sensors} onDragEnd={handleIncludedDragEnd}>
          <SortableContext
            items={visibleIncludedFacetIds}
            strategy={verticalListSortingStrategy}
          >
            {includedFacets.map(renderFacetRow)}
          </SortableContext>
        </DndContext>

        {nonIncludedFacets.map(renderFacetRow)}
      </div>

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
        <div className={styles.noAttributesBlock}>
          <Typography variant="bodyLarge">
            No, there are no attributes yet.
          </Typography>
          <Typography variant="bodyLarge">
            How about adding a subcategory first?
          </Typography>
        </div>
      )}

      <FilteredResultsPanel filteredFacets={filteredFacets.length} />
    </>
  );
};
