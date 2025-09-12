import styled from '@emotion/styled';
import { useEffect, useReducer, useState } from 'react';
import { useRouter } from 'next/router';

import type {
  MerchandisingCategoryRuleSet,
  MerchandisingCountryCode,
  MerchandisingExcludedFacets,
  MerchandisingKeywordRuleSet,
  MerchandisingRules,
  MerchandisingRuleSet,
  MerchandisingRuleSetFacetConfigWithId,
} from '@/libs/api';
import {
  CombinedDropdown,
  DropdownOption,
  ErrorMessage,
  Loader,
  ProductGridHeader,
  SearchKeywords,
  spacing,
  Tabs,
  Text,
  Typography,
} from '@/libs/components';
import { DateTimePickerModal } from '@/libs/components/calendar/date-time-picker-modal';
import { InfoBox } from '@/libs/components/infoBox/info-box';
import { color } from '@/libs/components/utils/constants';
import {
  BulkActions,
  CategorySearch,
  Preview,
  ProductSearchAll,
  RulesetAttributes,
  RulesetChanges,
  VisualEditor,
} from '@/libs/features';
import { usePreview } from '@/libs/hooks';
import { track } from '@/libs/hooks/utils/analytics';

import isEqual from 'lodash/isEqual';
import Image from 'next/image';
import pluralize from 'pluralize';

import { rulesetReducer } from './reducer';

const MAX_PINNED_PRODUCTS_ALLOWED = 100;

const CategoryPanel = styled.div`
  border-top: 2px solid #707070;
  padding: ${spacing(1)};
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(2)};
  align-items: end;
`;

const MainContainerPanel = styled.div`
  border-top: 1px solid #b1b1b1;
  margin: 0 ${spacing(1)};
  display: flex;
  position: relative;
`;

const ProductSearchPanel = styled.div<{ isFullWidth?: boolean }>`
  background-color: ${color.surfaceBright.surfaceBright};
  border-right: 1px solid #707070;
  margin: 0;
  margin-top: ${spacing(2.5)};
  width: ${(props) => (props.isFullWidth ? '100%' : '360px')};
`;

const VisualEditorPanel = styled.div`
  background-color: ${color.surfaceBright.surfaceBright};
  width: calc(100% - 360px);
  padding-left: 10px;
`;

const PanelTop = styled.div`
  background-color: ${color.surfaceBright.surfaceBright};
  z-index: 1;
  display: flex;
  align-items: center;
  border-bottom: solid 1px #b1b1b1;
  min-height: 76px;

  & > div {
    flex: 1;
  }
`;

const CountryPreviewWrapper = styled.div`
  position: relative;
  justify-content: end;
  display: flex;
`;

const CountryPreviewDropdown = styled(CombinedDropdown)`
  width: 155px;
  border-radius: 0;
  margin-bottom: 0;

  img {
    margin-left: -${spacing(2)};
    margin-right: ${spacing(1)};
  }

  span {
    padding-left: 0;
  }
`;

const FlagImage = styled(Image)`
  margin-left: -${spacing(1)};
`;

const TabContent = styled.div`
  height: calc(100vh - 334px);
  overflow: auto;
`;

const ProductCount = styled.div`
  padding: ${spacing(1)};
  text-align: right;
`;

const ProductSearchTabContent = styled(TabContent)`
  height: calc(100vh - 278px);
  overflow: hidden;
  padding-right: 10px;
`;

const CategorySearchWrapper = styled.div`
  margin-right: ${spacing(1)};
`;

const InfluenceWrapper = styled.div`
  width: 220px;
`;

const TextContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(1)};
  align-items: center;
  justify-content: center;
  height: 100%;
`;
const VisualEditorText = styled(Text)`
  font-size: 16px;
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
  categoriesInfo,
  rulesetFacets,
  rulesetExcludedFacets,
  rulesetId,
  rulesetMerchandisingRules,
  rulesetType,
  searchTerms,
  startDate,
  countryCode,
  writeEnabled,
}: {
  isEnabled: boolean;
  onSave?: ({
    ruleSetId,
    ruleSet,
    categoryIds,
    searchTerms,
  }: {
    ruleSetId: string;
    ruleSet: MerchandisingRuleSet;
    categoryIds?: Array<string>;
    searchTerms?: Array<string>;
  }) => void;
  onCancel: () => void;
  onCreate?: (
    args: Required<Pick<MerchandisingCategoryRuleSet, 'facets'>> &
      MerchandisingCategoryRuleSet
  ) => void;
  onCreateKeywordSearchRuleset?: (args: MerchandisingKeywordRuleSet) => void;
  categoriesInfo?: Array<{
    id: string;
    name?: string;
    plpUrl?: string;
  }>;
  rulesetFacets?: Array<MerchandisingRuleSetFacetConfigWithId>;
  rulesetExcludedFacets?: MerchandisingExcludedFacets;
  rulesetId?: string;
  rulesetMerchandisingRules?: MerchandisingRules;
  rulesetType: 'global' | 'category' | 'search';
  searchTerms?: string[];
  startDate?: string;
  endDate?: string;
  countryCode?: MerchandisingCountryCode;
  writeEnabled: boolean;
}) => {
  const categoryIds = categoriesInfo?.map((category) => category.id);

  const [selectedCategories, setSelectedCategories] = useState<Array<string>>(
    categoryIds || []
  );
  const [selectedCategoriesInfo, setSelectedCategoriesInfo] = useState<
    {
      id?: string;
      name?: string;
      plpUrl?: string;
    }[]
  >(categoriesInfo || []);

  const [rulesetSearchTerms, setRulesetSearchTerms] = useState(
    searchTerms || []
  );
  const [currentEditorTab, setCurrentEditorTab] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const defaultPreviewCountryCode =
    categoryIds?.[0].includes('IE_') ||
    (rulesetType === 'search' && countryCode === 'IE')
      ? 'IE'
      : 'UK';
  const [selectedPreviewCountryCode, setSelectedPreviewCountryCode] = useState<
    'UK' | 'IE'
  >(defaultPreviewCountryCode);

  const router = useRouter();

  const onSelectCategory = (category: {
    identifier: string;
    name: string;
    path: string;
  }) => {
    setSelectedCategories([...selectedCategories, category.identifier]);
    setSelectedCategoriesInfo([
      ...selectedCategoriesInfo,
      {
        id: category.identifier,
        name: category.name,
        plpUrl: category.path,
      },
    ]);

    // istanbul ignore else
    if (!selectedCategories.length) {
      setPreviewValue(category.identifier);
      setSelectedPreviewCountryCode(
        category.identifier.includes('IE_') ? 'IE' : 'UK'
      );
    }
    // istanbul ignore else
    if (!hasChanges) {
      setHasChanges(true);
    }
  };

  const [previewValue, setPreviewValue] = useState(
    categoryIds?.[0] || searchTerms?.[0]
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
    setRulesetSearchTerms([...rulesetSearchTerms, keyword]);

    if (!rulesetSearchTerms.length) {
      setPreviewValue(keyword);
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
    {
      title: 'Product',
    },
    {
      title: 'Attribute',
    },
    {
      title: 'Changes',
      count: totalCount,
    },
  ];

  const createKeywordSearchRuleset = () => {
    // istanbul ignore else
    if (onCreateKeywordSearchRuleset && rulesetSearchTerms.length) {
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
    } else {
      createKeywordSearchRuleset();
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
          (writeEnabled && rulesetType === 'global')
        }
        onSave={() => {
          onSaveRuleset();
          setHasChanges(false);
        }}
        hasPreview={!!selectedCategories.length || !!rulesetSearchTerms.length}
        onPreview={() => {
          setShowPreview(!showPreview);
          track({
            event: `Preview ${rulesetType} rule - ${rulesetType === 'category' ? previewValue : rulesetSearchTerms[0]}`,
          });
        }}
        hasChanges={
          hasChanges || !isEqual(merchandisingRules, rulesetMerchandisingRules)
        }
        isNewRuleSet={!!onCreate || !!onCreateKeywordSearchRuleset}
        onCancel={() => {
          onCancel();
        }}
        shouldHidePreview={rulesetType === 'global'}
        title="Product Grid"
        rulesetType={rulesetType}
        writeEnabled={writeEnabled}
      />

      <CategoryPanel>
        <InfluenceWrapper>
          <Typography as="p" withMargin variant="labelMedium">
            Influence
          </Typography>
          <CombinedDropdown
            variant="countrySelector"
            onChange={(country) => {
              dispatch({
                type: 'changeCountry',
                payload: country as MerchandisingCountryCode,
              });
              track({
                event: `Change ${rulesetType} ranking rule influence to ${country}`,
              });
              if (country === 'UK' && selectedPreviewCountryCode === 'IE') {
                setSelectedPreviewCountryCode('UK');
              }
              if (country === 'IE' && selectedPreviewCountryCode === 'UK') {
                setSelectedPreviewCountryCode('IE');
              }
            }}
            ariaLabel="Select country"
            selectedCountryCode={ruleset.countryCode}
            writeEnabled={writeEnabled}
          />
        </InfluenceWrapper>

        {rulesetType !== 'global' && (
          <>
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
                    setSelectedCategoriesInfo(
                      selectedCategoriesInfo.filter(
                        (categoryInfo) => categoryInfo.id !== category
                      )
                    );
                  }}
                  onSelectCategory={onSelectCategory}
                  selectedCategoriesInfo={selectedCategoriesInfo}
                  countryCode={ruleset.countryCode}
                  previewCategory={previewValue}
                  selectPreviewCategory={(category: string | undefined) => {
                    setPreviewValue(category);
                    setSelectedPreviewCountryCode(
                      category?.includes('IE_') ? 'IE' : 'UK'
                    );
                  }}
                  writeEnabled={writeEnabled}
                />
              </CategorySearchWrapper>
            )}

            {rulesetType === 'search' && (
              <SearchKeywords
                title="Search Keywords"
                searchTerms={rulesetSearchTerms}
                addSearchTerm={onAddSearchTerm}
                removeSearchTerm={onRemoveSearchTerm}
                previewSearchTerm={previewValue}
                selectPreviewSearchTerm={setPreviewValue}
                writeEnabled={writeEnabled}
              />
            )}
          </>
        )}

        {rulesetType === 'global' && (
          <InfoBox text="You are currently editing all pages on the M&S website and app" />
        )}

        {rulesetType !== 'global' && (
          <div>
            <Typography as="p" withMargin variant="labelMedium">
              Duration
            </Typography>
            <DateTimePickerModal
              showCalendarIcon
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
              writeEnabled={writeEnabled}
            />
          </div>
        )}
      </CategoryPanel>
      {merchandisingRules.pinnedProducts.length >
        MAX_PINNED_PRODUCTS_ALLOWED && (
        <ErrorMessage style={{ padding: 0 }} role="alert">
          Error: Please only pin 100 or fewer products
        </ErrorMessage>
      )}

      <Tabs
        tabs={rulesPanelTabs}
        onTabChange={(tab) => {
          setCurrentEditorTab(tab);
          setSelectedProducts([]);
          setSelectedSearchProducts([]);
          track({
            event: `${rulesetType} rules - ${rulesPanelTabs[tab].title} tab clicked`,
          });
        }}
        currentTab={currentEditorTab}
      />

      <MainContainerPanel>
        {(currentEditorTab === 0 || currentEditorTab === 1) && (
          <>
            <ProductSearchPanel isFullWidth={rulesetType === 'global'}>
              <ProductSearchTabContent>
                {currentEditorTab === 0 && (
                  <ProductSearchAll
                    isPinnable={rulesetType !== 'global'}
                    pinnedProductsCount={
                      merchandisingRules.pinnedProducts.length
                    }
                    merchandisingRules={merchandisingRules}
                    dispatch={dispatch}
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
                    rulesetType={rulesetType}
                    categoryIds={selectedCategories}
                    searchTerms={rulesetSearchTerms}
                  />
                )}
                {currentEditorTab === 1 && (
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
                    writeEnabled={writeEnabled}
                    rulesetType={rulesetType}
                  />
                )}
              </ProductSearchTabContent>
            </ProductSearchPanel>

            {rulesetType !== 'global' && (
              <VisualEditorPanel>
                <PanelTop>
                  <VisualEditorText>
                    <VisualEditorText as="span" isStrong>
                      VisualEditor -{' '}
                    </VisualEditorText>
                    {rulesetType === 'category'
                      ? selectedCategories[0]
                      : rulesetSearchTerms[0]}
                  </VisualEditorText>

                  {rulesetType === 'search' &&
                    ruleset.countryCode === 'UK_IE' && (
                      <CountryPreviewWrapper>
                        <CountryPreviewDropdown
                          variant="generic"
                          label={`${selectedPreviewCountryCode} view`}
                          icon={`icon-${selectedPreviewCountryCode.toLowerCase()}-flag`}
                          ariaLabel="Select country view for visual editor"
                          width={155}
                        >
                          <DropdownOption
                            as="button"
                            onClick={() => {
                              track({
                                event:
                                  'Change search ranking rule preview to IE',
                              });
                              setSelectedPreviewCountryCode('IE');
                            }}
                          >
                            <FlagImage
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
                              track({
                                event:
                                  'Change search ranking rule preview to UK',
                              });
                              setSelectedPreviewCountryCode('UK');
                            }}
                          >
                            <FlagImage
                              src="/trading-hub/asset/icon-uk-flag.svg"
                              width={20}
                              height={20}
                              alt="UK flag"
                            />
                            &nbsp; UK view
                          </DropdownOption>
                        </CountryPreviewDropdown>
                      </CountryPreviewWrapper>
                    )}
                </PanelTop>

                <TabContent>
                  {previewError && (
                    <ErrorMessage role="alert">
                      Error: {previewError}
                    </ErrorMessage>
                  )}

                  {selectedCategories.length || rulesetSearchTerms.length ? (
                    <>
                      <ProductCount>
                        <Text>
                          {data.products.length}{' '}
                          {data.pagination.totalItems &&
                          data.pagination.totalItems > data.products.length
                            ? `out of ${data.pagination.totalItems}`
                            : ''}
                          {` algo ${pluralize(' product', data.products.length)} loaded`}
                        </Text>
                      </ProductCount>

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
                              ? selectedProducts.filter(
                                  (product) => product !== id
                                )
                              : [...selectedProducts, id]
                          );
                        }}
                      />
                    </>
                  ) : (
                    <TextContent>
                      <p>No, there are no product rankings yet.</p>
                      <p>
                        You need to select a category or sub-category first.
                      </p>
                    </TextContent>
                  )}
                </TabContent>
              </VisualEditorPanel>
            )}
          </>
        )}

        {currentEditorTab === 2 && (
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
          rulesetType={rulesetType}
        />
      )}

      {isLoading && <Loader />}
    </>
  );
};
