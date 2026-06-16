import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/router';

import type {
  MerchandisingCountryCode,
  MerchandisingExcludedFacets,
  MerchandisingReturnedFacet,
} from '@/libs/api';
import {
  CombinedDropdown,
  DropdownVariant,
  Search,
  Typography,
} from '@/libs/components';
import { FilteredResultsPanel } from '@/libs/components/filtered-results-panel/filtered-results-panel';
import { InfoBox } from '@/libs/components/infoBox/info-box';
import { COLUMNS } from '@/libs/constants';
import { FacetsPanelAccordion } from '@/libs/containers/facets/facets-panel-accordion/facets-panel-accordion';
import { ProductGridHeader } from '@/libs/containers/shared/product-grid-header/product-grid-header';
import { createBoostedDragEndHandler } from '@/libs/features/facets/utils/create-boosted-drag-end-handler';
import { useFacetsFilter } from '@/libs/hooks';
import { useFacetOrderInput } from '@/libs/hooks/use-facet-order-input';
import { DEBOUNCE_DELAY_MS } from '@/libs/hooks/utils/constants';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';
import {
  type FacetDisplayType,
  type FacetRowDisplayValue,
  facetsPanelReducer,
} from '@/libs/stores/facets-panel/facets-panel-reducer';
import { useFacetsRowsSelector } from '@/libs/stores/facets-panel/use-facets-panel-rows-selector';

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { FacetRow } from './facet-row';
import styles from './facets-panel.module.css';

type FacetsPanelProps = {
  displayRowOrderControls?: boolean;
  title: string;
  countryCode: MerchandisingCountryCode;
  facetsData: MerchandisingReturnedFacet[];
  initialIncludedFacetIds: string[];
  initialExcludedFacetIds: string[];
  isWriteEnabled: boolean;
  onSave: (value: {
    includedFacets: MerchandisingReturnedFacet[];
    excludedFacets: MerchandisingExcludedFacets;
    countryCode: MerchandisingCountryCode;
  }) => void;
  onCancel: () => void;
  onFacetDataChange: ({
    value,
    facet,
  }: {
    value: string;
    facet: MerchandisingReturnedFacet;
  }) => void;
};

export const FacetsPanel = ({
  title,
  countryCode,
  facetsData,
  initialIncludedFacetIds,
  initialExcludedFacetIds,
  isWriteEnabled,
  onSave,
  onCancel,
  onFacetDataChange,
}: FacetsPanelProps) => {
  const router = useRouter();

  const [facetPanelLocalState, dispatch] = useReducer(facetsPanelReducer, {
    includedFacets: [],
    excludedFacets: [],
    countryCode,
    orders: {},
  });

  const initialOrders = useMemo(
    () =>
      Object.fromEntries(
        initialIncludedFacetIds.map((item, index) => [item, index + 1])
      ),
    [initialIncludedFacetIds]
  );

  useEffect(() => {
    dispatch({
      type: 'INITIALISE_STATE',
      payload: {
        includedFacets: initialIncludedFacetIds,
        excludedFacets: initialExcludedFacetIds,
        countryCode,
        orders: initialOrders,
      },
    });
  }, [
    initialIncludedFacetIds,
    initialExcludedFacetIds,
    countryCode,
    initialOrders,
  ]);

  const {
    facetsState,
    includedFacets: includedFacetsForSave,
    excludedFacets: excludedFacetsForSave,
  } = useFacetsRowsSelector(facetPanelLocalState, facetsData);

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
  }, DEBOUNCE_DELAY_MS);

  const handleIncludedDragEnd = useMemo(
    () =>
      createBoostedDragEndHandler({
        boostedOrder: includedFacetOrder,
        dispatch: (action) =>
          dispatch({
            type: 'SET_INCLUDED_ORDER',
            payload: action.payload,
          }),
        isWriteEnabled,
      }),
    [includedFacetOrder, isWriteEnabled]
  );

  const onFacetDataChangeRef = useRef(onFacetDataChange);

  useEffect(() => {
    // This only mutates the local ref, so we won't trigger a re-render.
    // eslint-disable-next-line functional/immutable-data
    onFacetDataChangeRef.current = onFacetDataChange;
  }, [onFacetDataChange]);

  const handleFacetDataChange = useCallback(
    ({
      value,
      facet,
    }: {
      value: string;
      facet: MerchandisingReturnedFacet;
    }) => {
      onFacetDataChangeRef.current({ value, facet });
    },
    []
  );

  const handleDisplayTypeChange = useCallback(
    (id: string, newDisplayType: FacetDisplayType) => {
      dispatch({
        type: 'CHANGE_DISPLAY_TYPE',
        payload: { id, newDisplayType },
      });
    },
    []
  );

  const displayValueByIdRef = useRef<Map<string, string>>(new Map());
  const displayValueCountRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const nextDisplayValueById = new Map(
      facetsState.map((facet) => [facet.id, facet.displayValue] as const)
    );

    const uniqueDisplayValues = Array.from(
      new Set(facetsState.map((facet) => facet.displayValue))
    );

    const nextDisplayValueCount = new Map(
      uniqueDisplayValues.map((displayValue) => [
        displayValue,
        facetsState.filter((facet) => facet.displayValue === displayValue)
          .length,
      ])
    );

    // These only mutate local refs, so we won't trigger a re-render.
    // eslint-disable-next-line functional/immutable-data
    displayValueByIdRef.current = nextDisplayValueById;
    // eslint-disable-next-line functional/immutable-data
    displayValueCountRef.current = nextDisplayValueCount;
  }, [facetsState]);

  const isDisplayValueDuplicate = useCallback(
    (facetId: string, value: string) => {
      const currentValue = displayValueByIdRef.current.get(facetId);
      const occurrences = displayValueCountRef.current.get(value) || 0;

      if (currentValue === value) {
        return occurrences > 1;
      }

      return occurrences > 0;
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
    []
  );

  const {
    getInputRef,
    localOrders,
    handleInputChange,
    handleInputBlur,
    handleInputKeyDown,
  } = useFacetOrderInput(
    handleOrderChangeCallback,
    facetPanelLocalState.orders
  );

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

  const canReorderIncludedFacets = boostedCount > 1;

  const renderFacetRow = useCallback(
    (facet: FacetRowDisplayValue) => {
      const { id } = facet;
      const errorMessage = errorStates[id]?.message ?? '';
      const order =
        facetPanelLocalState.orders[id] ?? includedFacetOrder.indexOf(id) + 1;
      const localOrder = localOrders[id] ?? order;

      return (
        <FacetRow
          key={id}
          facet={facet}
          errorMessage={errorMessage}
          isWriteEnabled={isWriteEnabled}
          canReorderIncludedFacets={canReorderIncludedFacets}
          order={order}
          localOrder={localOrder}
          isDisplayValueDuplicate={isDisplayValueDuplicate}
          countryCode={facetPanelLocalState.countryCode}
          ruleSetId={ruleSetId}
          setError={setError}
          onFacetDataChange={handleFacetDataChange}
          onDisplayTypeChange={handleDisplayTypeChange}
          getInputRef={getInputRef}
          handleInputChange={handleInputChange}
          handleInputBlur={handleInputBlur}
          handleInputKeyDown={handleInputKeyDown}
        />
      );
    },
    [
      errorStates,
      facetPanelLocalState.orders,
      includedFacetOrder,
      localOrders,
      isWriteEnabled,
      canReorderIncludedFacets,
      isDisplayValueDuplicate,
      facetPanelLocalState.countryCode,
      ruleSetId,
      setError,
      handleFacetDataChange,
      handleDisplayTypeChange,
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

  const handleSave = () => {
    onSave({
      includedFacets: includedFacetsForSave,
      excludedFacets: excludedFacetsForSave,
      countryCode: facetPanelLocalState.countryCode,
    });
  };

  return (
    <>
      <ProductGridHeader
        canSave
        onSave={handleSave}
        hasPreview={false}
        isNewRuleSet={false}
        hasChanges
        onCancel={onCancel}
        shouldHidePreview
        title={title}
        isWriteEnabled={isWriteEnabled}
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
              variant={DropdownVariant.CountrySelector}
              onChange={(country) => {
                dispatch({
                  type: 'CHANGE_COUNTRY',
                  payload: country as MerchandisingCountryCode,
                });
              }}
              selectedCountryCode={facetPanelLocalState.countryCode}
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

        <DndContext
          sensors={sensors}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragEnd={handleIncludedDragEnd}
        >
          <SortableContext
            items={visibleIncludedFacetIds}
            strategy={verticalListSortingStrategy}
          >
            <div>{includedFacets.map(renderFacetRow)}</div>
          </SortableContext>
        </DndContext>

        {nonIncludedFacets.map(renderFacetRow)}
      </div>

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
