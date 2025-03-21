import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useEffect, useReducer, useState } from 'react';
import { useRouter } from 'next/router';

import type {
  CategoryRuleSet,
  CountryCode,
  ExcludedFacets,
  KeywordRuleSet,
  MerchandisingRules,
  RuleSet,
  RuleSetFacetConfigWithId,
} from '@/libs/api';
import {
  BulkActions,
  CategorySearch,
  Dropdown,
  DropdownContent,
  DropdownItem,
  ErrorMessage,
  Loader,
  ProductGridHeader,
  SearchKeywords,
  SelectedCategory,
  spacing,
  Tabs,
  Text,
} from '@/libs/components';
import { DateTimePickerModal } from '@/libs/components/calendar/date-time-picker-modal';
import { CountrySelectorDropdown } from '@/libs/components/dropdowns/country-selector/country-selector';
import { Preview } from '@/libs/components/preview/preview';
import { ProductSearchAll } from '@/libs/components/product-search/all/product-search-all';
import { RulesetAttributes } from '@/libs/components/ruleset-attributes/ruleset-attributes';
import { RulesetChanges } from '@/libs/components/ruleset-changes/ruleset-changes';
import { checkForDuplicates } from '@/libs/components/utils/check-for-duplicates';
import { VisualEditor } from '@/libs/components/visual-editor/visual-editor';
import { usePreview } from '@/libs/hooks';

import isEqual from 'lodash/isEqual';
import Image from 'next/image';
import pluralize from 'pluralize';

import { rulesetReducer } from './reducer';

const MAX_PINNED_PRODUCTS_ALLOWED = 100;

const CategoryPanel = styled.div<{
  rulesetType: 'global' | 'category' | 'search';
}>`
  border-top: 2px solid #005640;
  padding: ${spacing(1)};
  ${({ rulesetType }) => css`
    display: grid;
    grid-template-columns: 220px auto;
    gap: ${spacing(2)};
    @media only screen and (min-width: 1200px) {
      ${rulesetType === 'global' &&
      /* istanbul ignore next */
      'grid-template-columns: 220px 490px 320px'};
      ${rulesetType === 'search' &&
      /* istanbul ignore next */
      'grid-template-columns: 220px 470px 320px'};
      ${rulesetType === 'category' &&
      'grid-template-columns: 220px 740px 320px'};
    }
  `}
`;

const RulesetIdentifier = styled.div`
  margin-right: ${spacing(2)};
`;

const MainContainerPanel = styled.div`
  display: flex;
  position: relative;
`;

const ProductSearchPanel = styled.div`
  background-color: #fff;
  border-right: 1px solid #707070;
  margin: 0;
  width: 360px;
`;

const RulesPanel = styled.div`
  background-color: #fff;
  width: calc(100% - 360px);
`;

const PanelTop = styled.div`
  background-color: #fff;
  padding-top: 1px;
  z-index: 1;
  display: flex;
  align-items: center;
  margin: 0 ${spacing(1)};
  border-bottom: solid 1px #b1b1b1;

  & > div {
    flex: 1;
  }
`;

const CountryPreviewWrapper = styled.div`
  position: relative;
  justify-content: end;
  display: flex;
`;

const CountryPreviewDropdown = styled(Dropdown)`
  width: 155px;
  border-radius: 0;

  img {
    margin-left: -${spacing(2)};
    margin-right: ${spacing(1)};
  }

  span {
    padding-left: 0;
  }
`;

const TabContent = styled.div`
  height: calc(100vh - 285px);
  overflow: auto;
  margin: 0 ${spacing(1)};
`;

const ProductCount = styled.div`
  padding: ${spacing(1)};
  text-align: right;
`;

const ProductSearchTabContent = styled(TabContent)`
  overflow: hidden;
`;

const CategorySearchWrapper = styled.div`
  min-width: 600px;
  width: 100%;
`;

const KeywordSearchWrapper = styled.div`
  min-width: 470px;
`;

const GlobalInfoWrapper = styled.div`
  width: 100%;
`;

const InfluenceWrapper = styled.div`
  margin-right: ${spacing(2)};
  width: 220px;
`;

const InfluenceLabel = styled(Text)`
  margin-bottom: ${spacing(1)};
  line-height: 1.6rem;
`;

const Duration = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(1)};

  label {
    margin-top: ${spacing(0.5)};
  }
`;

const LabelContainer = styled.label`
  display: flex;
  font-size: 14px;
  align-items: center;
`;

const TextContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(1)};
  align-items: center;
  justify-content: center;
  height: 100%;
`;

export type ChangePositionTypes = {
  isPinned: boolean;
  id: string;
  newPosition: number;
};

export const Ruleset = ({
  endDate,
  isEnabled,
  onCancel,
  onCreate,
  onCreateKeywordSearchRuleset,
  onSave,
  categoryIds,
  rulesetFacets,
  rulesetExcludedFacets,
  rulesetId,
  rulesetMerchandisingRules,
  rulesetType,
  searchTerms,
  startDate,
  countryCode,
  writeEnabled = true,
}: {
  isEnabled: boolean;
  onSave?: ({
    ruleSetId,
    ruleSet,
    categoryIds,
    searchTerms,
  }: {
    ruleSetId: string;
    ruleSet: RuleSet;
    categoryIds?: Array<string>;
    searchTerms?: Array<string>;
  }) => void;
  onCancel: () => void;
  onCreate?: (
    args: Required<Pick<CategoryRuleSet, 'facets'>> & CategoryRuleSet
  ) => void;
  onCreateKeywordSearchRuleset?: (args: KeywordRuleSet) => void;
  categoryIds?: Array<string>;
  rulesetFacets?: Array<RuleSetFacetConfigWithId>;
  rulesetExcludedFacets?: ExcludedFacets;
  rulesetId?: string;
  rulesetMerchandisingRules?: MerchandisingRules;
  rulesetType: 'global' | 'category' | 'search';
  searchTerms?: string[];
  startDate?: string;
  endDate?: string;
  countryCode?: CountryCode;
  writeEnabled?: boolean;
}) => {
  const [selectedCategories, setSelectedCategories] = useState<Array<string>>(
    categoryIds || []
  );
  const [rulesetSearchTerms, setRulesetSearchTerms] = useState(
    searchTerms || []
  );
  const [currentEditorTab, setCurrentEditorTab] = useState(0);
  const [currentProductTab, setCurrentProductTab] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [duplicationError, setDuplicationError] = useState('');

  const defaultPreviewCountryCode =
    (categoryIds && categoryIds[0].includes('IE_')) ||
    (rulesetType === 'search' && countryCode === 'IE')
      ? 'IE'
      : 'UK';
  const [selectedPreviewCountryCode, setSelectedPreviewCountryCode] = useState<
    'UK' | 'IE'
  >(defaultPreviewCountryCode);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

  const router = useRouter();

  const onSelectCategory = (category: string) => {
    const hasDuplicates = checkForDuplicates(
      [...selectedCategories],
      category,
      'ruleset'
    );

    if (hasDuplicates) {
      setDuplicationError(hasDuplicates);
    } else {
      setSelectedCategories([...selectedCategories, category]);

      if (!selectedCategories.length) {
        setPreviewValue(category);
        setSelectedPreviewCountryCode(category.includes('IE_') ? 'IE' : 'UK');
      }
      if (!hasChanges) {
        setHasChanges(true);
      }
      setDuplicationError('');
    }
  };

  const [previewValue, setPreviewValue] = useState(
    (categoryIds && categoryIds[0]) || (searchTerms && searchTerms[0])
  );

  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedSearchProducts, setSelectedSearchProducts] = useState<
    string[]
  >([]);

  const [ruleset, dispatch] = useReducer(rulesetReducer, {
    isEnabled,
    startDate,
    endDate,
    rules: rulesetMerchandisingRules || {
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
    countryCode: countryCode || 'UK_IE',
  });

  const { rules: merchandisingRules } = ruleset;

  useEffect(() => {
    const warningText =
      'You have unsaved changes - are you sure you wish to leave this page?';
    const noChanges = !hasChanges;
    /* istanbul ignore next */
    const handleWindowClose = (e: BeforeUnloadEvent) => {
      if (noChanges) return;
      e.preventDefault();
      return warningText;
    };
    /* istanbul ignore next */
    const handleBrowseAway = () => {
      if (noChanges) return;
      if (window.confirm(warningText)) return;
      router.events.emit('routeChangeError');
      throw 'routeChange aborted.';
    };
    window.addEventListener('beforeunload', handleWindowClose);
    router.events.on('routeChangeStart', handleBrowseAway);
    return () => {
      window.removeEventListener('beforeunload', handleWindowClose);
      router.events.off('routeChangeStart', handleBrowseAway);
    };
  }, [hasChanges, router]);

  const {
    data,
    error: previewError,
    isLoading,
  } = usePreview({
    ...(selectedCategories.length && { categoryId: previewValue }),
    ...(rulesetSearchTerms.length && { searchTerm: previewValue }),
    merchandisingRules: merchandisingRules,
    facetConfig: [],
    countryCode: selectedPreviewCountryCode,
  });

  const onAddSearchTerm = (keyword: string) => {
    const hasDuplicates = checkForDuplicates(
      [...rulesetSearchTerms],
      keyword,
      'keyword'
    );
    if (hasDuplicates) {
      setDuplicationError(hasDuplicates);
    } else {
      setRulesetSearchTerms([...rulesetSearchTerms, keyword]);

      if (!rulesetSearchTerms.length) {
        setPreviewValue(keyword);
      }
      setDuplicationError('');
    }
  };

  const onRemoveSearchTerm = (keyword: string) => {
    setRulesetSearchTerms(
      rulesetSearchTerms.filter((term) => term !== keyword)
    );
  };

  /* istanbul ignore next */
  const totalCount =
    merchandisingRules.pinnedProducts.length +
    merchandisingRules.blockedProducts.length +
    (merchandisingRules.boosts?.alphanumeric || []).length +
    (merchandisingRules.boosts?.numeric || []).length +
    (merchandisingRules.boosts?.product || []).length +
    (merchandisingRules.buries?.alphanumeric || []).length +
    (merchandisingRules.buries?.numeric || []).length +
    (merchandisingRules.buries?.product || []).length +
    (merchandisingRules.includes?.alphanumeric || []).length +
    (merchandisingRules.excludes?.alphanumeric || []).length;

  const rulesPanelTabs = [
    ...(rulesetType !== 'global' ? [{ title: 'Visual Editor' }] : []),
    {
      title: 'Changes',
      count: totalCount,
    },
  ];

  const onSaveRuleset = () => {
    if (onSave && rulesetId) {
      onSave({
        ruleSetId: rulesetId,
        ruleSet: {
          facets: rulesetFacets || [],
          isEnabled,
          rules: merchandisingRules,
          excludedFacets: rulesetExcludedFacets,
          startDate: ruleset.startDate,
          endDate: ruleset.endDate,
          countryCode: ruleset.countryCode,
        },
        categoryIds: selectedCategories,
        ...(rulesetSearchTerms && {
          searchTerms: rulesetSearchTerms,
        }),
      });
    } else if (onCreate && selectedCategories.length) {
      onCreate({
        facets: [],
        isEnabled,
        rules: merchandisingRules,
        categoryIds: selectedCategories,
        startDate: ruleset.startDate,
        endDate: ruleset.endDate,
        countryCode: ruleset.countryCode,
      });
    } else if (onCreateKeywordSearchRuleset && rulesetSearchTerms.length) {
      onCreateKeywordSearchRuleset({
        isEnabled,
        rules: merchandisingRules,
        searchTerms: rulesetSearchTerms,
        startDate: ruleset.startDate,
        endDate: ruleset.endDate,
        countryCode: ruleset.countryCode,
      });
    }
  };

  return (
    <>
      {showPreview && (
        <Preview
          onClose={() => setShowPreview(!showPreview)}
          categoryId={rulesetType === 'category' ? previewValue : undefined}
          searchTerm={rulesetType === 'search' ? previewValue : undefined}
          merchandisingRules={merchandisingRules}
          facetConfig={rulesetFacets || []}
          countryCode={selectedPreviewCountryCode}
          previewTitle={previewValue}
        />
      )}

      <ProductGridHeader
        canSave={
          (writeEnabled &&
            !!selectedCategories.length &&
            merchandisingRules.pinnedProducts.length <=
              MAX_PINNED_PRODUCTS_ALLOWED) ||
          (!!rulesetSearchTerms.length &&
            merchandisingRules.pinnedProducts.length <=
              MAX_PINNED_PRODUCTS_ALLOWED) ||
          rulesetType === 'global'
        }
        onSave={() => {
          onSaveRuleset();
          setHasChanges(false);
        }}
        hasPreview={!!selectedCategories.length || !!rulesetSearchTerms.length}
        onPreview={() => setShowPreview(!showPreview)}
        hasChanges={
          hasChanges || !isEqual(merchandisingRules, rulesetMerchandisingRules)
        }
        isNewRuleSet={!!onCreate || !!onCreateKeywordSearchRuleset}
        onCancel={() => {
          onCancel();
        }}
        shouldHidePreview={rulesetType === 'global'}
        title="Product Grid"
      />

      <CategoryPanel rulesetType={rulesetType}>
        <InfluenceWrapper>
          <InfluenceLabel>Influence</InfluenceLabel>
          <CountrySelectorDropdown
            onChange={(country) => {
              dispatch({ type: 'changeCountry', payload: country });
              if (country === 'UK' && selectedPreviewCountryCode === 'IE') {
                setSelectedPreviewCountryCode('UK');
              }
              if (country === 'IE' && selectedPreviewCountryCode === 'UK') {
                setSelectedPreviewCountryCode('IE');
              }
            }}
            selectedCountryCode={ruleset.countryCode}
          />
        </InfluenceWrapper>

        <RulesetIdentifier>
          {rulesetType === 'category' && (
            <CategorySearchWrapper>
              <CategorySearch
                selectedCategories={selectedCategories}
                onClearSelection={(category: string) => {
                  setSelectedCategories(
                    selectedCategories.filter(
                      (categoryName) => categoryName !== category
                    )
                  );
                }}
                onSelectCategory={onSelectCategory}
                countryCode={ruleset.countryCode}
                previewCategory={previewValue}
                selectPreviewCategory={(category: string | undefined) => {
                  setPreviewValue(category);
                  setSelectedPreviewCountryCode(
                    category?.includes('IE_') ? 'IE' : 'UK'
                  );
                }}
                error={duplicationError}
              />
            </CategorySearchWrapper>
          )}

          {rulesetType === 'search' && (
            <KeywordSearchWrapper>
              <SearchKeywords
                title="Search Keywords"
                searchTerms={rulesetSearchTerms}
                addSearchTerm={onAddSearchTerm}
                removeSearchTerm={onRemoveSearchTerm}
                previewSearchTerm={previewValue}
                selectPreviewSearchTerm={setPreviewValue}
                error={duplicationError}
              />
            </KeywordSearchWrapper>
          )}

          {rulesetType === 'global' && (
            <GlobalInfoWrapper>
              <SelectedCategory label="All pages" />
            </GlobalInfoWrapper>
          )}
        </RulesetIdentifier>

        {rulesetType !== 'global' && (
          <Duration>
            <LabelContainer>Duration</LabelContainer>
            <DateTimePickerModal
              showCalendarIcon={true}
              onUpdateDateTimeRange={(dateTime: [Date | null, Date | null]) =>
                dispatch({
                  type: 'dateTime',
                  payload: {
                    dateTime,
                  },
                })
              }
              dateTime={[
                ruleset.startDate ? new Date(ruleset.startDate) : null,
                ruleset.endDate ? new Date(ruleset.endDate) : null,
              ]}
            />
          </Duration>
        )}
      </CategoryPanel>
      {duplicationError && (
        <ErrorMessage style={{ padding: 0 }}>{duplicationError}</ErrorMessage>
      )}
      {merchandisingRules.pinnedProducts.length >
        MAX_PINNED_PRODUCTS_ALLOWED && (
        <ErrorMessage style={{ padding: 0 }}>
          Error: Please only pin 100 or fewer products
        </ErrorMessage>
      )}

      <MainContainerPanel>
        <ProductSearchPanel>
          <PanelTop>
            <Tabs
              tabs={[{ title: 'Product' }, { title: 'Attribute' }]}
              onTabChange={(tab) => {
                setCurrentProductTab(tab);
                setSelectedProducts([]);
                setSelectedSearchProducts([]);
              }}
              currentTab={currentProductTab}
            />
          </PanelTop>
          {(!!selectedCategories.length ||
            rulesetSearchTerms.length ||
            rulesetType === 'global') && (
            <ProductSearchTabContent>
              {currentProductTab === 0 && (
                <ProductSearchAll
                  isPinnable={rulesetType !== 'global'}
                  pinnedProductsCount={merchandisingRules.pinnedProducts.length}
                  merchandisingRules={merchandisingRules}
                  dispatch={dispatch}
                  categoryIds={selectedCategories}
                  searchTerms={rulesetSearchTerms}
                  countryCode={ruleset.countryCode}
                  selectedProducts={selectedSearchProducts}
                  isSelectionDisabled={
                    !writeEnabled || !!selectedProducts.length
                  }
                  onSelectAll={setSelectedSearchProducts}
                  onSelectProduct={({ id, isSelected }) => {
                    setSelectedSearchProducts(
                      isSelected
                        ? selectedSearchProducts.filter(
                            (product) => product !== id
                          )
                        : [...selectedSearchProducts, id]
                    );
                  }}
                />
              )}
              {currentProductTab === 1 && (
                <RulesetAttributes
                  merchandisingRules={merchandisingRules}
                  categories={selectedCategories}
                  countryCode={
                    ruleset.countryCode ||
                    // reducer always sets a country code but optional in api
                    // istanbul ignore next
                    'UK_IE'
                  }
                  dispatch={dispatch}
                  searchTerms={rulesetSearchTerms}
                />
              )}
            </ProductSearchTabContent>
          )}
        </ProductSearchPanel>
        <RulesPanel>
          <PanelTop>
            <Tabs
              tabs={rulesPanelTabs}
              onTabChange={(tab) => {
                setCurrentEditorTab(tab);
                setSelectedProducts([]);
                setSelectedSearchProducts([]);
              }}
              currentTab={currentEditorTab}
            />
            {rulesetType === 'search' && ruleset.countryCode === 'UK_IE' && (
              <CountryPreviewWrapper>
                <CountryPreviewDropdown
                  label={`${selectedPreviewCountryCode} view`}
                  isOpen={isCountryDropdownOpen}
                  icon={`icon-${selectedPreviewCountryCode.toLowerCase()}-flag`}
                  onOpen={() => {
                    setIsCountryDropdownOpen(true);
                  }}
                  onClose={() => {
                    setIsCountryDropdownOpen(false);
                  }}
                  aria-label="Select country view for visual editor"
                >
                  <DropdownContent isLeftAligned>
                    <DropdownItem
                      as="button"
                      onClick={() => {
                        setSelectedPreviewCountryCode('IE');
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
                        setSelectedPreviewCountryCode('UK');
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
              </CountryPreviewWrapper>
            )}
          </PanelTop>
          <TabContent>
            {previewError && <ErrorMessage>Error: {previewError}</ErrorMessage>}

            <ProductCount>
              {rulesetType !== 'global' && (
                <Text>
                  {data.products.length}{' '}
                  {data.pagination.totalItems &&
                  data.pagination.totalItems > data.products.length
                    ? `out of ${data.pagination.totalItems}`
                    : ''}
                  {` algo ${pluralize(' product', data.products.length)} loaded`}
                </Text>
              )}
            </ProductCount>

            {currentEditorTab === 0 &&
              rulesetType !== 'global' &&
              (selectedCategories.length || rulesetSearchTerms.length ? (
                <VisualEditor
                  products={data.products}
                  dispatch={dispatch}
                  selectedProducts={selectedProducts}
                  isSelectionDisabled={
                    !writeEnabled || !!selectedSearchProducts.length
                  }
                  onSelectProduct={({ id, isSelected }) => {
                    setSelectedProducts(
                      isSelected
                        ? selectedProducts.filter((product) => product !== id)
                        : [...selectedProducts, id]
                    );
                  }}
                />
              ) : (
                <TextContent>
                  <p>No, there are no product rankings yet.</p>
                  <p>You need to select a category or sub-category first.</p>
                </TextContent>
              ))}
            {(currentEditorTab === 1 || rulesetType === 'global') && (
              <RulesetChanges
                merchandisingRules={merchandisingRules}
                dispatch={dispatch}
                isPinnable={rulesetType !== 'global'}
                countryCode={ruleset.countryCode}
                selectedProducts={selectedProducts}
                onSelectAll={setSelectedProducts}
                onSelectProduct={({ id, isSelected }) => {
                  setSelectedProducts(
                    isSelected
                      ? selectedProducts.filter((product) => product !== id)
                      : [...selectedProducts, id]
                  );
                }}
                isSelectionDisabled={
                  !writeEnabled || selectedSearchProducts.length > 0
                }
              />
            )}
          </TabContent>
        </RulesPanel>
      </MainContainerPanel>
      {(selectedProducts.length > 0 || selectedSearchProducts.length > 0) && (
        <BulkActions
          dispatch={dispatch}
          hasRestore={selectedProducts.length > 0}
          selectedProducts={[...selectedProducts, ...selectedSearchProducts]}
          onReset={() => {
            setSelectedProducts([]);
            setSelectedSearchProducts([]);
          }}
          ruleset={ruleset}
        />
      )}

      {isLoading && <Loader />}
    </>
  );
};
