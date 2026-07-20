import type { ReactElement } from 'react';
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';

import type { MerchandisingRuleSet } from '@/libs/api';
import {
  Button,
  CombinedDropdown,
  DropdownVariant,
  ErrorMessage,
  Search,
  Typography,
} from '@/libs/components';
import dropdownStyles from '@/libs/components/dropdown/dropdown.module.css';
import { FilteredResultsPanel } from '@/libs/components/filtered-results-panel/filtered-results-panel';
import { RulesetDiffModal } from '@/libs/components/ruleset-diff-modal/ruleset-diff-modal';
import { FacetType } from '@/libs/constants/rule-types';
import { FacetRow } from '@/libs/containers/facets/facet-row';
import { FacetsPanelAccordion } from '@/libs/containers/facets/facets-panel-accordion/facets-panel-accordion';
import { DateTimePickerModal } from '@/libs/containers/shared/calendar/date-time-picker-modal';
import { ProductGridHeader } from '@/libs/containers/shared/product-grid-header/product-grid-header';
import { CategorySearch, Preview } from '@/libs/features';
import styles from '@/libs/features/facets/facets-panel/facets-panel.module.css';
import { createBoostedDragEndHandler } from '@/libs/features/facets/utils/create-boosted-drag-end-handler';
import { SearchKeywords } from '@/libs/features/shared/search-keywords/search-keywords';
import {
  useDraftRuleset,
  useFacetsList,
  useGlobalFacetsList,
  useTypeSafeQuery,
} from '@/libs/hooks';
import { useFacetListDiff } from '@/libs/hooks/use-facet-list-diff';
import { useFacetOrderInput } from '@/libs/hooks/use-facet-order-input';
import { track } from '@/libs/hooks/utils/analytics';
import { DEBOUNCE_DELAY_MS } from '@/libs/hooks/utils/constants';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';
import { rulesetReducer } from '@/libs/stores/ruleset/reducer';

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
import Image from 'next/image';

import { FacetListReducer } from './facets-list-ui-reducer';

const COLUMNS: {
  label: string;
}[] = [
  { label: 'Ranking' },
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

type CategoryIds = { categoryIds: string[] };
type SearchTerms = { searchTerms: string[] };

type SaveType = MerchandisingRuleSet & (CategoryIds | SearchTerms);

export type FacetsListProps = {
  facetType: FacetType;
  isNewRuleset: boolean;
  onCancel: () => void;
  onSave: (args: SaveType) => void;
  isWriteEnabled: boolean;
  currentRuleset?: MerchandisingRuleSet;
  categoriesInfo?: Array<{
    id: string;
    name?: string;
    plpUrl?: string;
  }>;
  searchTerms?: string[];
};

export const FacetsList = ({
  currentRuleset,
  facetType,
  isNewRuleset,
  categoriesInfo,
  searchTerms,
  onCancel,
  onSave,
  isWriteEnabled,
}: FacetsListProps): ReactElement => {
  const { getStringParam } = useTypeSafeQuery();
  const rulesetId = getStringParam('id');

  const { getDraft, clearDraft } = useDraftRuleset();

  const defaultRuleset: MerchandisingRuleSet = {
    isEnabled: facetType !== FacetType.Global,
    startDate: undefined,
    endDate: undefined,
    rules: {
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
    },
    countryCode: 'UK_IE',
    excludedFacets: { facets: [] },
    facets: [],
  };

  const [ruleset, dispatch] = useReducer(
    rulesetReducer,
    currentRuleset || defaultRuleset
  );

  const initialRuleset = useRef(currentRuleset || defaultRuleset);

  const initialFacetIdSet = useMemo(
    () => new Set((initialRuleset.current.facets ?? []).map((f) => f.id)),
    []
  );

  const hasChanges = useMemo(() => {
    const initial = initialRuleset.current;
    const initialFacetIds = (initial.facets ?? []).map((f) => f.id).join(',');
    const currentFacetIds = (ruleset.facets ?? []).map((f) => f.id).join(',');
    const initialExcluded = (initial.excludedFacets?.facets ?? [])
      .map((f) => f.id)
      .sort()
      .join(',');
    const currentExcluded = (ruleset.excludedFacets?.facets ?? [])
      .map((f) => f.id)
      .sort()
      .join(',');
    return (
      initialFacetIds !== currentFacetIds || initialExcluded !== currentExcluded
    );
  }, [ruleset.facets, ruleset.excludedFacets]);

  const [facetListState, dispatchFacetList] = useReducer(FacetListReducer, {
    isDraftLoaded: false,
    shouldShowPreview: false,
    previewValue: categoriesInfo?.[0].id || searchTerms?.[0],
    selectedPreviewCountryCode: 'UK',
    selectedCategoriesInfo: categoriesInfo || [],
    selectedSearchTerms: searchTerms || [],
    filter: '',
  });

  const {
    isDraftLoaded,
    shouldShowPreview,
    previewValue,
    selectedPreviewCountryCode,
    selectedCategoriesInfo,
    selectedSearchTerms,
    filter,
  } = facetListState;

  // Load draft after hydration to avoid SSR mismatch
  useEffect(() => {
    if (!isNewRuleset || isDraftLoaded || currentRuleset) {
      return;
    }

    const draft = getDraft();
    if (draft?.type !== facetType) {
      dispatchFacetList({ type: 'setDraftLoaded' });
      return;
    }

    dispatch({ type: 'loadRuleset', payload: draft.ruleset });

    if (draft.type === 'category' && draft.ruleset.categoryIds?.length > 0) {
      dispatchFacetList({
        type: 'setCategories',
        payload: draft.ruleset.categoryIds.map((id: string) => ({ id })),
      });
      dispatchFacetList({
        type: 'setPreviewValue',
        payload: draft.ruleset.categoryIds[0],
      });
    }
    if (draft.type === 'search' && draft.ruleset.searchTerms?.length > 0) {
      dispatchFacetList({
        type: 'setSearchTerms',
        payload: draft.ruleset.searchTerms,
      });
      dispatchFacetList({
        type: 'setPreviewValue',
        payload: draft.ruleset.searchTerms[0],
      });
    }

    dispatchFacetList({ type: 'setDraftLoaded' });
  }, [isNewRuleset, isDraftLoaded, currentRuleset, facetType, getDraft]);

  const onRemoveCategory = (category: string) => {
    dispatchFacetList({ type: 'removeCategory', payload: category });
  };

  const onSelectCategory = (category: {
    identifier: string;
    name: string;
    path: string;
  }) => {
    dispatchFacetList({
      type: 'addCategory',
      payload: {
        id: category.identifier,
        name: category.name,
        plpUrl: category.path,
      },
    });
    dispatchFacetList({
      type: 'setPreviewCountryCode',
      payload: category.identifier.includes('IE_') ? 'IE' : 'UK',
    });
  };

  const onRemoveSearchTerm = (term: string) => {
    dispatchFacetList({ type: 'removeSearchTerm', payload: term });
  };

  const onAddSearchTerm = (term: string) => {
    dispatchFacetList({ type: 'addSearchTerm', payload: term });
  };

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const { callback: handleFilter } = useDebounce((val: string) => {
    dispatchFacetList({ type: 'setFilter', payload: val });
  }, DEBOUNCE_DELAY_MS);

  const handleSetPreviewValue = useCallback((value: string | undefined) => {
    dispatchFacetList({ type: 'setPreviewValue', payload: value });
  }, []);

  const selectedCategories = selectedCategoriesInfo.map(
    (category) => category.id
  );

  const {
    facets,
    isLoading: isFacetsLoading,
    error: getFacetsDataError,
  } = useFacetsList({
    query:
      facetType === FacetType.Category
        ? selectedCategories
        : selectedSearchTerms,
    queryBy: facetType === FacetType.Category ? 'categoryIds' : 'searchTerms',
    enabled: true,
    countryCode: ruleset.countryCode || 'UK_IE',
  });

  const { facets: globalFacets, isLoading: isGlobalFacetsLoading } =
    useGlobalFacetsList();

  const allFacetsForDiff = useMemo(
    () => [...facets, ...globalFacets],
    [facets, globalFacets]
  );

  const diffItems = useFacetListDiff(
    initialRuleset.current.facets ?? [],
    ruleset.facets ?? [],
    initialRuleset.current.excludedFacets?.facets ?? [],
    ruleset.excludedFacets?.facets ?? [],
    allFacetsForDiff,
    {
      ...(facetType === FacetType.Category && {
        originalCategories: categoriesInfo ?? [],
        currentCategories: selectedCategoriesInfo,
      }),
      ...(facetType === FacetType.Search && {
        originalSearchTerms: searchTerms ?? [],
        currentSearchTerms: selectedSearchTerms,
      }),
      originalStartDate: initialRuleset.current.startDate,
      currentStartDate: ruleset.startDate,
      originalEndDate: initialRuleset.current.endDate,
      currentEndDate: ruleset.endDate,
    }
  );

  const handleSave = () => {
    setIsReviewModalOpen(true);
  };

  const handleConfirmSave = () => {
    onSave({
      ...ruleset,
      categoryIds: selectedCategories,
      searchTerms: selectedSearchTerms,
    });
    setIsReviewModalOpen(false);
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
    () => ruleset.facets?.map((facet) => facet.id) || [],
    [ruleset.facets]
  );

  const initialFacetOrders = useMemo(
    () =>
      ruleset.facets?.reduce(
        (acc, facet, index) => ({
          ...acc,
          [facet.id]: index + 1,
        }),
        {}
      ) || {},
    [ruleset.facets]
  );

  const {
    inputRefs,
    localOrders,
    handleInputChange,
    handleInputBlur,
    handleInputKeyDown,
  } = useFacetOrderInput((facetId: string, newIndex: number) => {
    dispatch({
      type: 'facetChangePosition',
      payload: {
        id: facetId,
        position: newIndex,
      },
    });
  }, initialFacetOrders);

  const filteredFacets = filter.length
    ? facets.filter(
        (facet) =>
          facet.displayValue.toLowerCase().includes(filter.toLowerCase()) ||
          facet.indexPropertyName.toLowerCase().includes(filter.toLowerCase())
      )
    : facets;

  const boostedFacets = useMemo(
    () =>
      ruleset.facets?.map((facetConfig) => {
        // Ghost-facet detection must use the unfiltered facet lists, so a
        // facet only matching the search filter isn't mistaken for one
        // that's genuinely no longer available.
        const found = facets.find((f) => f.id === facetConfig.id);
        const isGlobalFacetsReady = !isFacetsLoading && !isGlobalFacetsLoading;
        const resolvedFacet =
          found ??
          (isGlobalFacetsReady
            ? globalFacets.find((f) => f.id === facetConfig.id)
            : undefined);

        if (!resolvedFacet) return undefined;

        const matchesFilter =
          !filter.length ||
          resolvedFacet.displayValue
            .toLowerCase()
            .includes(filter.toLowerCase()) ||
          resolvedFacet.indexPropertyName
            .toLowerCase()
            .includes(filter.toLowerCase());

        if (!matchesFilter) return undefined;

        return found ? found : { ...resolvedFacet, isUnavailable: true };
      }) || [],
    [
      ruleset.facets,
      facets,
      globalFacets,
      isFacetsLoading,
      isGlobalFacetsLoading,
      filter,
    ]
  );

  const filteredIncludedFacetIds = useMemo(
    () => boostedFacets.filter((facet) => facet).map((facet) => facet!.id),
    [boostedFacets]
  );

  const handleIncludedDragEnd = useMemo(
    () =>
      createBoostedDragEndHandler({
        boostedOrder: includedFacetOrder,
        dispatch: (action) =>
          dispatch({
            type: 'facetChangePosition',
            payload: {
              id: action.payload.id,
              position: action.payload.newIndex,
            },
          }),
        isWriteEnabled,
      }),
    [dispatch, includedFacetOrder, isWriteEnabled]
  );

  const handleFacetOrderInputRef = useCallback(
    (facetId: string) => (el: HTMLInputElement | null) => {
      if (el) {
        // eslint-disable-next-line functional/immutable-data
        inputRefs.current[facetId] = el;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const excludedFacets = filteredFacets
    .map((facet) =>
      ruleset.excludedFacets?.facets?.some((f) => f.id === facet.id)
        ? facet
        : null
    )
    .filter(Boolean);

  const defaultFacets = filteredFacets
    .map((facet) =>
      !ruleset.excludedFacets?.facets?.some((f) => f.id === facet.id) &&
      !ruleset.facets?.some((f) => f.id === facet.id)
        ? facet
        : null
    )
    .filter(Boolean);

  const handleCancel = () => {
    clearDraft();
    onCancel();
  };

  return (
    <>
      {shouldShowPreview && (
        <Preview
          onClose={() => dispatchFacetList({ type: 'togglePreview' })}
          categoryId={
            facetType === FacetType.Category ? previewValue : undefined
          }
          searchTerm={facetType === FacetType.Search ? previewValue : undefined}
          merchandisingRules={ruleset.rules}
          facetConfig={ruleset.facets || []}
          excludedFacets={ruleset.excludedFacets}
          countryCode={selectedPreviewCountryCode}
          previewTitle={previewValue}
        />
      )}

      <ProductGridHeader
        canSave={
          !!selectedCategoriesInfo.length ||
          !!selectedSearchTerms.length ||
          facetType === FacetType.Global
        }
        onSave={handleSave}
        hasPreview={
          !!selectedCategoriesInfo?.length || !!selectedSearchTerms?.length
        }
        onPreview={() => {
          dispatchFacetList({ type: 'togglePreview' });
          track({
            event: `Preview ${facetType} facets - ${facetType === FacetType.Category ? previewValue : selectedSearchTerms.join(', ')}`,
          });
        }}
        isNewRuleSet={!!isNewRuleset}
        hasChanges={hasChanges}
        onCancel={handleCancel}
        title={
          facetType === FacetType.Global
            ? 'Global Facet Rule Editor'
            : 'Facet Rule Editor'
        }
        shouldHidePreview={facetType === FacetType.Global}
        rulesetType={facetType}
        isWriteEnabled={isWriteEnabled}
      />

      {getFacetsDataError && (
        <ErrorMessage>
          Error retrieving facet list: {getFacetsDataError}
        </ErrorMessage>
      )}

      <div className={styles.sectionWrapper}>
        <Typography variant="bodyMedium" isStrong withMargin>
          Rule scope
        </Typography>
        <div className={styles.scopeWrapper}>
          <div>
            <Typography as="p" withMargin variant="labelMedium">
              Influence
            </Typography>
            <CombinedDropdown
              variant={DropdownVariant.CountrySelector}
              onChange={(country) => {
                dispatch({
                  type: 'changeCountry',
                  payload: country as 'UK' | 'IE',
                });
                track({
                  event: `Change ${facetType} facet influence to ${country}`,
                });
                // istanbul ignore else
                if (country !== 'UK_IE') {
                  dispatchFacetList({
                    type: 'setPreviewCountryCode',
                    payload: country as 'UK' | 'IE',
                  });
                }
              }}
              selectedCountryCode={ruleset.countryCode}
              ariaLabel="Select country"
            />
          </div>
          {facetType === FacetType.Category && (
            <CategorySearch
              selectedCategories={selectedCategories}
              countryCode={ruleset.countryCode}
              previewCategory={previewValue}
              onClearSelection={onRemoveCategory}
              onSelectCategory={onSelectCategory}
              selectedCategoriesInfo={selectedCategoriesInfo}
              selectPreviewCategory={handleSetPreviewValue}
              isWriteEnabled={isWriteEnabled}
            />
          )}
          {facetType === FacetType.Search && (
            <SearchKeywords
              title="Search Keywords"
              searchTerms={selectedSearchTerms}
              addSearchTerm={onAddSearchTerm}
              removeSearchTerm={onRemoveSearchTerm}
              previewSearchTerm={previewValue}
              selectPreviewSearchTerm={handleSetPreviewValue}
              isWriteEnabled={isWriteEnabled}
            />
          )}
          {facetType !== FacetType.Global && (
            <div className={styles.duration}>
              <Typography as="p" withMargin variant="labelMedium">
                Duration
              </Typography>
              <DateTimePickerModal
                showCalendarIcon
                onUpdateDateTimeRange={(dateTime) => {
                  dispatch({
                    type: 'dateTime',
                    payload: {
                      dateTime,
                    },
                  });
                }}
                dateTime={[
                  ruleset.startDate ? new Date(ruleset.startDate) : null,
                  ruleset.endDate ? new Date(ruleset.endDate) : null,
                ]}
                isWriteEnabled={isWriteEnabled}
              />
            </div>
          )}
          {facetType === FacetType.Search &&
            ruleset.countryCode === 'UK_IE' && (
              <div>
                <Typography as="p" withMargin variant="labelMedium">
                  Preview Country
                </Typography>
                <CombinedDropdown
                  variant={DropdownVariant.Generic}
                  label={`${selectedPreviewCountryCode} view`}
                  width={155}
                  icon={`icon-${selectedPreviewCountryCode?.toLowerCase()}-flag`}
                  ariaLabel="Select country for preview"
                >
                  <Button
                    className={dropdownStyles.dropdownOption}
                    data-hover-grey
                    type="button"
                    onClick={() => {
                      track({ event: 'Change search facets preview to IE' });
                      dispatchFacetList({
                        type: 'setPreviewCountryCode',
                        payload: 'IE',
                      });
                    }}
                    role="menuitemradio"
                    aria-checked={selectedPreviewCountryCode === 'IE'}
                  >
                    <Image
                      src="/trading-hub/asset/icon-ie-flag.svg"
                      width={20}
                      height={20}
                      alt="IE flag"
                    />
                    <Typography as="span" variant="bodySmall">
                      &nbsp; IE view
                    </Typography>
                  </Button>
                  <Button
                    className={dropdownStyles.dropdownOption}
                    data-hover-grey
                    type="button"
                    onClick={() => {
                      track({ event: 'Change search facets preview to UK' });
                      dispatchFacetList({
                        type: 'setPreviewCountryCode',
                        payload: 'UK',
                      });
                    }}
                    role="menuitemradio"
                    aria-checked={selectedPreviewCountryCode === 'UK'}
                  >
                    <Image
                      src="/trading-hub/asset/icon-uk-flag.svg"
                      width={20}
                      height={20}
                      alt="UK flag"
                    />
                    &nbsp; UK view
                  </Button>
                </CombinedDropdown>
              </div>
            )}
        </div>

        <FacetsPanelAccordion
          boostedCount={boostedFacets.length}
          excludedCount={excludedFacets.length}
          nonBoostedExcludedCount={defaultFacets.length}
        />
      </div>

      {(selectedCategories.length > 0 || selectedSearchTerms.length > 0) && (
        <div className={styles.sectionWrapper}>
          <div className={styles.searchWrapper}>
            <Search
              onChange={(e) => handleFilter(e.target.value.trim())}
              placeholder="Search"
            />
          </div>
        </div>
      )}

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
            items={filteredIncludedFacetIds}
            strategy={verticalListSortingStrategy}
          >
            <div>
              {boostedFacets.map(
                (facet, index) =>
                  facet && (
                    <FacetRow
                      key={facet.id}
                      {...facet}
                      displayType="included"
                      isDragDisabled={
                        !isWriteEnabled || boostedFacets.length <= 1
                      }
                      index={index}
                      includedFacetOrder={includedFacetOrder}
                      localOrders={localOrders}
                      handleInputChange={handleInputChange}
                      handleInputBlur={handleInputBlur}
                      handleInputKeyDown={handleInputKeyDown}
                      handleFacetOrderInputRef={handleFacetOrderInputRef}
                      isWriteEnabled={isWriteEnabled}
                      selectedCategories={selectedCategories}
                      selectedSearchTerms={selectedSearchTerms}
                      facetType={facetType}
                      countryCode={ruleset.countryCode || 'UK_IE'}
                      rulesetId={rulesetId}
                      onDispatch={dispatch}
                      isNewRuleset={isNewRuleset}
                      currentRuleset={ruleset}
                      hasChanges={hasChanges}
                      isNewlyIncluded={!initialFacetIdSet.has(facet.id)}
                    />
                  )
              )}
            </div>
          </SortableContext>
        </DndContext>

        {defaultFacets.map(
          (facet, index) =>
            facet && (
              <FacetRow
                key={facet.id}
                {...facet}
                displayType="algoControl"
                index={index}
                isWriteEnabled={isWriteEnabled}
                onDispatch={dispatch}
                hasChanges={false}
              />
            )
        )}

        {excludedFacets.map(
          (facet, index) =>
            facet && (
              <FacetRow
                key={facet.id}
                {...facet}
                displayType="excluded"
                index={index}
                isWriteEnabled={isWriteEnabled}
                onDispatch={dispatch}
                hasChanges={false}
              />
            )
        )}
      </div>

      {filteredFacets.length === 0 && facetType !== FacetType.Global && (
        <div className={styles.noAttributesBlock}>
          <Typography variant="bodyLarge">
            No, there are no attributes yet.
          </Typography>
          <Typography variant="bodyLarge">
            How about adding a subcategory first?
          </Typography>
        </div>
      )}

      {filteredFacets.length === 0 && facetType === FacetType.Global && (
        <div className={styles.noAttributesBlock}>
          <Typography variant="bodySmall">
            Please create the ruleset before editing facets.
          </Typography>
        </div>
      )}

      <FilteredResultsPanel filteredFacets={filteredFacets.length} />

      <RulesetDiffModal
        opened={isReviewModalOpen}
        diffItems={diffItems}
        onConfirm={handleConfirmSave}
        onCancel={() => setIsReviewModalOpen(false)}
      />
    </>
  );
};
