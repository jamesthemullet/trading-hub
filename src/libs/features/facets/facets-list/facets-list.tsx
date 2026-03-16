import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { useRouter } from 'next/router';

import type { MerchandisingRuleSet } from '@/libs/api';
import {
  Button,
  CombinedDropdown,
  ErrorMessage,
  Search,
  Typography,
} from '@/libs/components';
import dropdownStyles from '@/libs/components/dropdown/dropdown.module.css';
import { FilteredResultsPanel } from '@/libs/components/filtered-results-panel/filtered-results-panel';
import { FacetRow } from '@/libs/containers/facets/facet-row';
import { FacetsPanelAccordion } from '@/libs/containers/facets/facets-panel-accordion/facets-panel-accordion';
import { DateTimePickerModal } from '@/libs/containers/shared/calendar/date-time-picker-modal';
import { ProductGridHeader } from '@/libs/containers/shared/product-grid-header/product-grid-header';
import { CategorySearch, Preview } from '@/libs/features';
import styles from '@/libs/features/facets/facets-panel/facets-panel.module.css';
import { createBoostedDragEndHandler } from '@/libs/features/facets/utils/create-boosted-drag-end-handler';
import { SearchKeywords } from '@/libs/features/shared/search-keywords/search-keywords';
import { useDraftRuleset, useFacetsList } from '@/libs/hooks';
import { useFacetOrderInput } from '@/libs/hooks/use-facet-order-input';
import { track } from '@/libs/hooks/utils/analytics';
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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import Image from 'next/image';

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
  facetType: 'search' | 'category' | 'global';
  isNewRuleset: boolean;
  onCancel: () => void;
  onSave: (args: SaveType) => void;
  writeEnabled: boolean;
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
  writeEnabled,
}: FacetsListProps) => {
  const router = useRouter();
  const rulesetId = router.query.id as string;

  const { getDraft, clearDraft } = useDraftRuleset();

  const defaultRuleset: MerchandisingRuleSet = {
    isEnabled: facetType !== 'global',
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

  const [isDraftLoaded, setIsDraftLoaded] = useState(false);

  const [showPreview, setShowPreview] = useState(false);

  const [previewValue, setPreviewValue] = useState<string | undefined>(
    categoriesInfo?.[0].id || searchTerms?.[0]
  );

  const [selectedPreviewCountryCode, setSelectedPreviewCountryCode] = useState<
    'UK' | 'IE'
  >('UK');

  const [selectedCategoriesInfo, setSelectedCategoriesInfo] = useState<
    {
      id: string;
      name?: string;
      plpUrl?: string;
    }[]
  >(categoriesInfo || []);

  const [selectedSearchTerms, setSelectedSearchTerms] = useState<Array<string>>(
    searchTerms || []
  );

  // Load draft after hydration to avoid SSR mismatch
  useEffect(() => {
    if (!isNewRuleset || isDraftLoaded || currentRuleset) {
      return;
    }

    const draft = getDraft();
    if (!draft || draft.type !== facetType) {
      setIsDraftLoaded(true);
      return;
    }

    dispatch({ type: 'loadRuleset', payload: draft.ruleset });

    if (draft.type === 'category' && draft.ruleset.categoryIds?.length > 0) {
      setSelectedCategoriesInfo(
        draft.ruleset.categoryIds.map((id: string) => ({ id }))
      );
      setPreviewValue(draft.ruleset.categoryIds[0]);
    }
    if (draft.type === 'search' && draft.ruleset.searchTerms?.length > 0) {
      setSelectedSearchTerms(draft.ruleset.searchTerms);
      setPreviewValue(draft.ruleset.searchTerms[0]);
    }

    setIsDraftLoaded(true);
  }, [isNewRuleset, isDraftLoaded, currentRuleset, facetType, getDraft]);

  const onRemoveCategory = (category: string) => {
    setSelectedCategoriesInfo(
      selectedCategoriesInfo?.filter(
        (categoriesInfo) => categoriesInfo.id !== category
      )
    );
  };

  const onSelectCategory = (category: {
    identifier: string;
    name: string;
    path: string;
  }) => {
    setSelectedCategoriesInfo([
      ...selectedCategoriesInfo,
      {
        id: category.identifier,
        name: category.name,
        plpUrl: category.path,
      },
    ]);
    setSelectedPreviewCountryCode?.(
      category.identifier.includes('IE_') ? 'IE' : 'UK'
    );
  };

  const onRemoveSearchTerm = (term: string) => {
    setSelectedSearchTerms(
      selectedSearchTerms.filter((searchTerm) => searchTerm !== term)
    );
  };

  const onAddSearchTerm = (term: string) => {
    setSelectedSearchTerms([...selectedSearchTerms, term]);
  };

  const handleSave = () => {
    onSave({
      ...ruleset,
      categoryIds: selectedCategories,
      searchTerms: selectedSearchTerms,
    });
  };

  const [filter, setFilter] = useState('');
  const { callback: handleFilter } = useDebounce((val: string) => {
    setFilter(val);
  }, 300);

  const selectedCategories = selectedCategoriesInfo.map(
    (category) => category.id
  );

  const { facets, error: getFacetsDataError } = useFacetsList({
    query: facetType === 'category' ? selectedCategories : selectedSearchTerms,
    queryBy: facetType === 'category' ? 'categoryIds' : 'searchTerms',
    enabled: true,
    countryCode: ruleset.countryCode || 'UK_IE',
  });

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
        {} as Record<string, number>
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
      ruleset.facets?.map((facet) =>
        filteredFacets.find((f) => f.id === facet.id)
      ) || [],
    [ruleset.facets, filteredFacets]
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
        writeEnabled,
      }),
    [dispatch, includedFacetOrder, writeEnabled]
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
      {showPreview && (
        <Preview
          onClose={() => setShowPreview(!showPreview)}
          categoryId={facetType === 'category' ? previewValue : undefined}
          searchTerm={facetType === 'search' ? previewValue : undefined}
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
          facetType === 'global'
        }
        onSave={handleSave}
        hasPreview={
          !!selectedCategoriesInfo?.length || !!selectedSearchTerms?.length
        }
        onPreview={() => {
          setShowPreview(!showPreview);
          track({
            event: `Preview ${facetType} facets - ${facetType === 'category' ? previewValue : selectedSearchTerms.join(', ')}`,
          });
        }}
        isNewRuleSet={!!isNewRuleset}
        hasChanges
        onCancel={handleCancel}
        title={
          facetType === 'global'
            ? 'Global Facet Rule Editor'
            : 'Facet Rule Editor'
        }
        shouldHidePreview={facetType === 'global'}
        rulesetType={facetType}
        writeEnabled={writeEnabled}
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
              variant="countrySelector"
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
                  setSelectedPreviewCountryCode(country as 'UK' | 'IE');
                }
              }}
              selectedCountryCode={ruleset.countryCode}
              ariaLabel="Select country"
            />
          </div>
          {facetType === 'category' && (
            <CategorySearch
              selectedCategories={selectedCategories}
              countryCode={ruleset.countryCode}
              previewCategory={previewValue}
              onClearSelection={onRemoveCategory}
              onSelectCategory={onSelectCategory}
              selectedCategoriesInfo={selectedCategoriesInfo}
              selectPreviewCategory={setPreviewValue}
              writeEnabled={writeEnabled}
            />
          )}
          {facetType === 'search' && (
            <SearchKeywords
              title="Search Keywords"
              searchTerms={selectedSearchTerms}
              addSearchTerm={onAddSearchTerm}
              removeSearchTerm={onRemoveSearchTerm}
              previewSearchTerm={previewValue}
              selectPreviewSearchTerm={setPreviewValue}
              writeEnabled={writeEnabled}
            />
          )}
          {facetType !== 'global' && (
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
                writeEnabled={writeEnabled}
              />
            </div>
          )}
          {facetType === 'search' && ruleset.countryCode === 'UK_IE' && (
            <div>
              <Typography as="p" withMargin variant="labelMedium">
                Preview Country
              </Typography>
              <CombinedDropdown
                variant="generic"
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
                    setSelectedPreviewCountryCode?.('IE');
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
                    setSelectedPreviewCountryCode?.('UK');
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

        <DndContext sensors={sensors} onDragEnd={handleIncludedDragEnd}>
          <SortableContext
            items={filteredIncludedFacetIds}
            strategy={verticalListSortingStrategy}
          >
            {boostedFacets.map(
              (facet, index) =>
                facet && (
                  <FacetRow
                    key={facet.id}
                    {...facet}
                    displayType="included"
                    isDragDisabled={!writeEnabled || boostedFacets.length <= 1}
                    index={index}
                    includedFacetOrder={includedFacetOrder}
                    localOrders={localOrders}
                    handleInputChange={handleInputChange}
                    handleInputBlur={handleInputBlur}
                    handleInputKeyDown={handleInputKeyDown}
                    handleFacetOrderInputRef={handleFacetOrderInputRef}
                    writeEnabled={writeEnabled}
                    selectedCategories={selectedCategories}
                    selectedSearchTerms={selectedSearchTerms}
                    facetType={facetType}
                    countryCode={ruleset.countryCode || 'UK_IE'}
                    rulesetId={rulesetId}
                    onDispatch={dispatch}
                    isNewRuleset={isNewRuleset}
                    currentRuleset={ruleset}
                  />
                )
            )}
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
                writeEnabled={writeEnabled}
                onDispatch={dispatch}
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
                writeEnabled={writeEnabled}
                onDispatch={dispatch}
              />
            )
        )}
      </div>

      {filteredFacets.length === 0 && facetType !== 'global' && (
        <div className={styles.noAttributesBlock}>
          <Typography variant="bodyLarge">
            No, there are no attributes yet.
          </Typography>
          <Typography variant="bodyLarge">
            How about adding a subcategory first?
          </Typography>
        </div>
      )}

      {filteredFacets.length === 0 && facetType === 'global' && (
        <div className={styles.noAttributesBlock}>
          <Typography variant="bodySmall">
            Please create the ruleset before editing facets.
          </Typography>
        </div>
      )}

      <FilteredResultsPanel filteredFacets={filteredFacets.length} />
    </>
  );
};
