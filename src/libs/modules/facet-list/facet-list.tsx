import { useMemo, useReducer, useState } from 'react';
import { useRouter } from 'next/router';

import type {
  MerchandisingReturnedFacet,
  MerchandisingRuleSet,
  MerchandisingRuleSetFacetConfigWithId,
} from '@/libs/api';
import {
  ButtonDeprecated,
  CombinedDropdown,
  DropdownOption,
  ErrorMessage,
  Search,
  Text,
  Typography,
} from '@/libs/components';
import { DragHandleButton } from '@/libs/components/edit-facet-modal-content/edit-facet-modal-content.styles';
import {
  AttributesTable,
  Col,
  Duration,
  LowerHeading,
  NoAttributesBlock,
  OrderColumn,
  Row,
  ScopeWrapper,
  SearchWrapper,
  SectionWrapper,
} from '@/libs/components/facets-panel/facets-panel.styles';
import { useShowNewFacetValuesPage } from '@/libs/components/feature-flag/feature-flag';
import { FilteredResultsPanel } from '@/libs/components/filtered-results-panel/filtered-results-panel';
import { getFacetRoute } from '@/libs/constants';
import { FacetsPanelAccordion } from '@/libs/containers/facets/facets-panel-accordion/facets-panel-accordion';
import type { SortableRowRenderArgs } from '@/libs/containers/facets/sortable-row/sortable-row';
import { SortableRow } from '@/libs/containers/facets/sortable-row/sortable-row';
import { DateTimePickerModal } from '@/libs/containers/shared/calendar/date-time-picker-modal';
import { ProductGridHeader } from '@/libs/containers/shared/product-grid-header/product-grid-header';
import { TableHeading } from '@/libs/containers/shared/table/table.styles';
import {
  CategorySearch,
  Preview,
  SearchAndCategoryFacetsPanelModal,
} from '@/libs/features';
import { createBoostedDragEndHandler } from '@/libs/features/facets/utils/create-boosted-drag-end-handler';
import { SearchKeywords } from '@/libs/features/shared/search-keywords/search-keywords';
import { useFacetsList } from '@/libs/hooks';
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

export type FacetDisplayType = 'included' | 'algoControl' | 'excluded';

type FacetRowDisplayValue = MerchandisingReturnedFacet & {
  displayType: FacetDisplayType;
  index: number;
};

type CategoryIds = { categoryIds: string[] };
type SearchTerms = { searchTerms: string[] };

type SaveType = MerchandisingRuleSet & (CategoryIds | SearchTerms);

export type Props = {
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

export const FacetList = ({
  currentRuleset,
  facetType,
  isNewRuleset,
  categoriesInfo,
  searchTerms,
  onCancel,
  onSave,
  writeEnabled,
}: Props) => {
  const showNewFacetValuesPage = useShowNewFacetValuesPage();
  const router = useRouter();
  const [ruleset, dispatch] = useReducer(
    rulesetReducer,
    currentRuleset || {
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
    }
  );

  const [showPreview, setShowPreview] = useState(false);

  const [previewValue, setPreviewValue] = useState<string | undefined>(
    categoriesInfo?.[0].id || searchTerms?.[0]
  );

  const [selectedPreviewCountryCode, setSelectedPreviewCountryCode] = useState<
    'UK' | 'IE'
  >('UK');

  const [selectedFacet, setSelectedFacet] = useState<
    MerchandisingReturnedFacet | undefined
  >(undefined);
  const [isFacetValuesModalOpen, setIsFacetValuesModalOpen] = useState(false);

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

  const FacetRow = (facet: FacetRowDisplayValue) => {
    const { displayValue, displayType, id } = facet;
    const isIncludedFacet = displayType === 'included';
    const isDragDisabled = !writeEnabled || boostedFacets.length <= 1;

    const renderRow = (sortableProps?: SortableRowRenderArgs) => (
      <Row
        optionSelected={displayType}
        data-testid={`Row showing ${facet.displayValue} as ${displayType}`}
        key={sortableProps ? undefined : id}
        ref={sortableProps?.setNodeRef}
        style={sortableProps?.style}
      >
        <Col>
          <Text>{facet.indexPropertyName}</Text>
        </Col>
        <Col>
          <Text>{facet.displayValue}</Text>
        </Col>
        <Col>
          <OrderColumn>
            <CombinedDropdown
              variant="facetOrder"
              status={displayType}
              onChange={(status) => {
                if (status === displayType) return;
                dispatch({
                  type: 'facetChangeDisplayType',
                  payload: {
                    id: facet.id,
                    newType: status as FacetDisplayType,
                    oldType: displayType,
                  },
                });
              }}
              hasAlgoControl
              writeEnabled={writeEnabled}
              ariaLabel="Select to set as included, excluded or algo control"
            />
          </OrderColumn>
        </Col>
        <Col>
          {displayType === 'included' && showNewFacetValuesPage && (
            <ButtonDeprecated
              as="a"
              theme="secondary"
              href={(() => {
                const ruleSetId = router.query.id as string;
                const baseUrl = getFacetRoute(
                  facetType,
                  'valuesEdit',
                  facet.id
                );
                const params = new URLSearchParams({
                  ruleSetId,
                  displayName: facet.displayValue,
                  countryCode: ruleset.countryCode || 'UK_IE',
                });

                if (facetType === 'category' && selectedCategories.length > 0) {
                  selectedCategories.forEach((categoryId) => {
                    params.append('categories', categoryId);
                  });
                }

                if (facetType === 'search' && selectedSearchTerms.length > 0) {
                  selectedSearchTerms.forEach((term) => {
                    params.append('searchTerms', term);
                  });
                }

                return `${baseUrl}?${params.toString()}`;
              })()}
            >
              {writeEnabled ? 'Edit values' : 'View values'}
            </ButtonDeprecated>
          )}
          {displayType === 'included' &&
            writeEnabled &&
            !showNewFacetValuesPage && (
              <ButtonDeprecated
                onClick={() => {
                  setIsFacetValuesModalOpen(true);
                  const rulesetConfig = ruleset.facets?.find(
                    (f) => f.id === facet.id
                  );
                  setSelectedFacet({
                    ...facet,
                    boosted: rulesetConfig?.boosted,
                    excludedValues: rulesetConfig?.excludedValues,
                  });
                }}
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
        <SortableRow key={id} id={id} disabled={isDragDisabled}>
          {(sortableProps) => renderRow(sortableProps)}
        </SortableRow>
      );
    }

    return renderRow();
  };

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
        onCancel={onCancel}
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

      <SectionWrapper>
        <LowerHeading isStrong>Rule scope</LowerHeading>
        <ScopeWrapper>
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
              writeEnabled={writeEnabled}
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
            <Duration>
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
            </Duration>
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
                <DropdownOption
                  as="button"
                  onClick={() => {
                    track({ event: 'Change search facets preview to IE' });
                    setSelectedPreviewCountryCode?.('IE');
                  }}
                >
                  <Image
                    src="/trading-hub/asset/icon-ie-flag.svg"
                    width={20}
                    height={20}
                    alt="IE flag"
                  />
                  &nbsp; IE view
                </DropdownOption>
                <DropdownOption
                  as="button"
                  onClick={() => {
                    track({ event: 'Change search facets preview to UK' });
                    setSelectedPreviewCountryCode?.('UK');
                  }}
                >
                  <Image
                    src="/trading-hub/asset/icon-uk-flag.svg"
                    width={20}
                    height={20}
                    alt="UK flag"
                  />
                  &nbsp; UK view
                </DropdownOption>
              </CombinedDropdown>
            </div>
          )}
        </ScopeWrapper>

        <FacetsPanelAccordion
          boostedCount={boostedFacets.length}
          excludedCount={excludedFacets.length}
          nonBoostedExcludedCount={defaultFacets.length}
        />
      </SectionWrapper>

      {(selectedCategories.length > 0 || selectedSearchTerms.length > 0) && (
        <SectionWrapper>
          <SearchWrapper>
            <Search
              onChange={(e) => handleFilter(e.target.value.trim())}
              placeholder="Search"
            />
          </SearchWrapper>
        </SectionWrapper>
      )}

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
                    index={index}
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
              />
            )
        )}
      </AttributesTable>

      {filteredFacets.length === 0 && facetType !== 'global' && (
        <NoAttributesBlock>
          <Text>No, there are no attributes yet.</Text>
          <Text>How about adding a subcategory first?</Text>
        </NoAttributesBlock>
      )}

      {filteredFacets.length === 0 && facetType === 'global' && (
        <NoAttributesBlock>
          <Text>Please create the ruleset before editing facets.</Text>
        </NoAttributesBlock>
      )}

      <FilteredResultsPanel filteredFacets={filteredFacets.length} />

      {isFacetValuesModalOpen && selectedFacet && (
        <SearchAndCategoryFacetsPanelModal
          onClose={() => setIsFacetValuesModalOpen(false)}
          saveButtonLabel="Done"
          onSave={(facet: MerchandisingRuleSetFacetConfigWithId) => {
            setIsFacetValuesModalOpen(false);
            dispatch({
              type: 'facetUpdateValues',
              payload: {
                id: facet.id,
                boosted: facet.boosted!,
                excludedValues: facet.excludedValues!,
              },
            });
          }}
          facet={selectedFacet}
          categories={facetType === 'category' ? selectedCategories : undefined}
          countryCode={ruleset.countryCode!}
          writeEnabled={writeEnabled}
        />
      )}
    </>
  );
};
