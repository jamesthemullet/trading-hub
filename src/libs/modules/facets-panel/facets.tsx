import { useReducer, useState } from 'react';

import type {
  MerchandisingReturnedFacet,
  MerchandisingRuleSet,
  MerchandisingRuleSetFacetConfigWithId,
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
  Text,
  Typography,
} from '@/libs/components';
import { ArrowButton } from '@/libs/components/buttons/button/arrow-button';
import { DateTimePickerModal } from '@/libs/components/calendar/date-time-picker-modal';
import { CountrySelectorDropdown } from '@/libs/components/dropdowns/country-selector/country-selector';
import { FacetOrderDropdown } from '@/libs/components/dropdowns/facet-order-dropdown/facet-order-dropdown';
import { FilteredResultsPanel } from '@/libs/components/filtered-results-panel/filtered-results-panel';
import { SearchAndCategoryFacetsPanelModal } from '@/libs/components/modals/facet-panel/search-and-category/search-and-category-facets-panel-modal';
import { Preview } from '@/libs/components/preview/preview';
import { TableHeading } from '@/libs/components/table/table.styles';
import { useFacetsList } from '@/libs/hooks';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';

import Image from 'next/image';

import { rulesetReducer } from '../ruleset/reducer';
import {
  AttributesTable,
  Col,
  CountryPreviewDropdown,
  Duration,
  LowerHeading,
  NoAttributesBlock,
  OrderArrowsContainer,
  OrderColumn,
  Row,
  ScopeWrapper,
  SectionWrapper,
} from './facets-panel.styles';

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

export type FacetRowDisplayValue = MerchandisingReturnedFacet & {
  displayType: FacetDisplayType;
  index: number;
};

type CategoryIds = { categoryIds: string[] };
type SearchTerms = { searchTerms: string[] };

type SaveType = MerchandisingRuleSet & (CategoryIds | SearchTerms);

export type Props = {
  facetType: 'search' | 'category';
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

export const Facets = ({
  currentRuleset,
  facetType,
  isNewRuleset,
  categoriesInfo,
  searchTerms,
  onCancel,
  onSave,
  writeEnabled,
}: Props) => {
  const [ruleset, dispatch] = useReducer(
    rulesetReducer,
    currentRuleset || {
      isEnabled: true,
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
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

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

  const FacetRow = (facet: FacetRowDisplayValue) => {
    const { displayValue, displayType, id, index } = facet;

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
          <Text>{facet.displayValue}</Text>
        </Col>
        <Col>
          <OrderColumn>
            <FacetOrderDropdown
              status={displayType}
              onChange={(status) => {
                if (status === displayType) return;
                dispatch({
                  type: 'facetChangeDisplayType',
                  payload: {
                    id: facet.id,
                    newType: status,
                    oldType: displayType,
                  },
                });
              }}
              hasAlgoControl
              writeEnabled={writeEnabled}
            />

            {displayType === 'included' && writeEnabled && (
              <OrderArrowsContainer>
                <ArrowButton
                  direction="up"
                  aria-label={`Move ${displayValue} row up`}
                  onClick={() => {
                    dispatch({
                      type: 'facetChangePosition',
                      payload: {
                        position: index - 1,
                        id,
                      },
                    });
                  }}
                  isDisabled={index === 0}
                />

                <ArrowButton
                  direction="down"
                  aria-label={`Move ${displayValue} row down`}
                  onClick={() => {
                    dispatch({
                      type: 'facetChangePosition',
                      payload: {
                        position: index + 1,
                        id,
                      },
                    });
                  }}
                  isDisabled={index === boostedFacets.length - 1}
                />
              </OrderArrowsContainer>
            )}
          </OrderColumn>
        </Col>
        <Col>
          {displayType === 'included' && writeEnabled && (
            <Button
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
            </Button>
          )}
        </Col>
      </Row>
    );
  };

  const filteredFacets = filter.length
    ? facets.filter(
        (facet) =>
          facet.displayValue?.toLowerCase().includes(filter.toLowerCase()) ||
          facet.indexPropertyName.toLowerCase().includes(filter.toLowerCase())
      )
    : facets;

  const boostedFacets =
    ruleset.facets?.map((facet) =>
      filteredFacets.find((f) => f.id === facet.id)
    ) || [];
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
          !!selectedCategoriesInfo.length || !!selectedSearchTerms.length
        }
        onSave={handleSave}
        hasPreview={
          !!selectedCategoriesInfo?.length || !!selectedSearchTerms?.length
        }
        onPreview={() => setShowPreview(!showPreview)}
        isNewRuleSet={!!isNewRuleset}
        hasChanges
        onCancel={onCancel}
        title="Facet Rule Editor"
        shouldHidePreview={false}
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
            <CountrySelectorDropdown
              onChange={(country) => {
                dispatch({ type: 'changeCountry', payload: country });
                if (country !== 'UK_IE') {
                  setSelectedPreviewCountryCode(country);
                }
              }}
              selectedCountryCode={ruleset.countryCode}
              writeEnabled={writeEnabled}
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
          <Duration>
            <Typography as="p" withMargin variant="labelMedium">
              Duration
            </Typography>
            <DateTimePickerModal
              showCalendarIcon={true}
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

          {facetType === 'search' && ruleset.countryCode === 'UK_IE' && (
            <div>
              <Typography as="p" withMargin variant="labelMedium">
                Preview Country
              </Typography>
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
      </SectionWrapper>

      {(selectedCategories.length > 0 || selectedSearchTerms.length > 0) && (
        <SectionWrapper>
          <Search onChange={(e) => handleFilter(e.target.value.trim())} />
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
