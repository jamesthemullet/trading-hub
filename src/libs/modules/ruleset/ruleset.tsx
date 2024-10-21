import styled from '@emotion/styled';
import { useContext, useEffect, useReducer, useState } from 'react';
import { useRouter } from 'next/router';

import type {
  Category,
  CategoryRuleSet,
  ExcludedFacets,
  KeywordRuleSet,
  MerchandisingRules,
  RuleSet,
  RuleSetFacetConfigWithId,
} from '@/libs/api';
import {
  CategorySearch,
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
import { FeatureFlagContext } from '@/libs/components/context/feature-flag';
import { Preview } from '@/libs/components/preview/preview';
import { ProductSearch } from '@/libs/components/product-search/product-search';
import { RulesetAttributes } from '@/libs/components/ruleset-attributes/ruleset-attributes';
import { RulesetChanges } from '@/libs/components/ruleset-changes/ruleset-changes';
import { Action } from '@/libs/components/types';
import { VisualEditor } from '@/libs/components/visual-editor/visual-editor';
import { usePreview } from '@/libs/hooks';

import isEqual from 'lodash/isEqual';
import pluralize from 'pluralize';

import { rulesetReducer } from './reducer';

const CategoryPanel = styled.div`
  border-top: 2px solid #005640;
  padding: ${spacing(1)};
  display: flex;
`;

const MainContainerPanel = styled.div`
  display: flex;
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

  div {
    flex: 1;
  }
`;

const TabContent = styled.div`
  height: calc(100vh - 285px);
  overflow: auto;
  margin: 0 ${spacing(1)};
`;

const ProductSearchTabContent = styled(TabContent)`
  overflow: hidden;
`;

const CategorySearchWrapper = styled.div`
  min-width: 600px;
`;

const KeywordSearchWrapper = styled.div`
  min-width: 470px;
`;

const GlobalInfoWrapper = styled.div`
  width: 100%;
`;

const Duration = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: ${spacing(2)};
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
  rulesetCategory,
  rulesetFacets,
  rulesetExcludedFacets,
  rulesetId,
  rulesetMerchandisingRules,
  rulesetType,
  searchTerms,
  startDate,
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
  rulesetCategory?: Required<Category>;
  rulesetFacets?: Array<RuleSetFacetConfigWithId>;
  rulesetExcludedFacets?: ExcludedFacets;
  rulesetId?: string;
  rulesetMerchandisingRules?: MerchandisingRules;
  rulesetType: 'global' | 'category' | 'search';
  searchTerms?: string[];
  startDate?: string;
  endDate?: string;
}) => {
  const [selectedCategory, setSelectedCategory] = useState<
    Required<Category> | undefined
  >(rulesetCategory);
  const [rulesetSearchTerms, setRulesetSearchTerms] = useState(
    searchTerms || []
  );
  const [currentEditorTab, setCurrentEditorTab] = useState(0);
  const [currentProductTab, setCurrentProductTab] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const router = useRouter();
  const featureFlags = useContext(FeatureFlagContext);

  const onSelectCategory = (category: Required<Category>) => {
    setSelectedCategory(category);
    if (!hasChanges) setHasChanges(true);
  };

  const [ruleset, dispatch] = useReducer<
    (state: RuleSet, action: Action) => RuleSet
  >(rulesetReducer, {
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
    ...(selectedCategory && { categoryId: selectedCategory.identifier }),
    ...(rulesetSearchTerms && { searchTerm: rulesetSearchTerms[0] }),
    merchandisingRules: merchandisingRules,
    facetConfig: [],
  });

  const onAddSearchTerm = (keyword: string) => {
    setRulesetSearchTerms([...rulesetSearchTerms, keyword]);
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
        },
        ...(selectedCategory?.identifier && {
          categoryIds: [selectedCategory.identifier],
        }),
        ...(rulesetSearchTerms && {
          searchTerms: rulesetSearchTerms,
        }),
      });
    } else if (onCreate && selectedCategory?.identifier) {
      onCreate({
        facets: [],
        isEnabled,
        rules: merchandisingRules,
        categoryId: selectedCategory.identifier,
        startDate: ruleset.startDate,
        endDate: ruleset.endDate,
      });
    } else if (onCreateKeywordSearchRuleset && rulesetSearchTerms.length) {
      onCreateKeywordSearchRuleset({
        isEnabled,
        rules: merchandisingRules,
        searchTerms: rulesetSearchTerms,
        startDate: ruleset.startDate,
        endDate: ruleset.endDate,
      });
    }
  };

  return (
    <>
      {showPreview && (
        <Preview
          onClose={() => setShowPreview(!showPreview)}
          categoryId={selectedCategory?.identifier}
          searchTerm={rulesetSearchTerms[0]}
          merchandisingRules={merchandisingRules}
          facetConfig={rulesetFacets || []}
        />
      )}

      <ProductGridHeader
        canSave={
          !!selectedCategory?.identifier ||
          !!rulesetSearchTerms.length ||
          rulesetType === 'global'
        }
        onSave={() => {
          onSaveRuleset();
          setHasChanges(false);
        }}
        hasPreview={
          !!selectedCategory?.identifier || !!rulesetSearchTerms.length
        }
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

      <CategoryPanel>
        {rulesetType === 'category' && (
          <CategorySearchWrapper>
            <CategorySearch
              selectedCategory={selectedCategory}
              onClearSelection={() => {
                setSelectedCategory(undefined);
              }}
              onSelectCategory={onSelectCategory}
              canRemoveCategory={true}
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
            />
          </KeywordSearchWrapper>
        )}

        {rulesetType === 'global' && (
          <GlobalInfoWrapper>
            <SelectedCategory label="All pages" />
          </GlobalInfoWrapper>
        )}

        {rulesetType !== 'global' && featureFlags.hasScheduling && (
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

      <MainContainerPanel>
        <ProductSearchPanel>
          <PanelTop>
            <Tabs
              tabs={[{ title: 'Product' }, { title: 'Attribute' }]}
              onTabChange={setCurrentProductTab}
              currentTab={currentProductTab}
            />
          </PanelTop>
          <ProductSearchTabContent>
            {currentProductTab === 0 && (
              <ProductSearch
                isPinnable={rulesetType !== 'global'}
                pinnedProductsCount={merchandisingRules.pinnedProducts.length}
                merchandisingRules={merchandisingRules}
                dispatch={dispatch}
                categoryId={selectedCategory?.identifier}
                searchTerms={rulesetSearchTerms}
              />
            )}
            {currentProductTab === 1 && (
              <RulesetAttributes
                merchandisingRules={merchandisingRules}
                category={selectedCategory?.identifier}
                dispatch={dispatch}
                searchTerms={rulesetSearchTerms}
              />
            )}
          </ProductSearchTabContent>
        </ProductSearchPanel>
        <RulesPanel>
          <PanelTop>
            <Tabs
              tabs={rulesPanelTabs}
              onTabChange={setCurrentEditorTab}
              currentTab={currentEditorTab}
            />
            {rulesetType === 'category' && (
              <Text>
                {data.products.length}{' '}
                {pluralize(' product', data.products.length)}{' '}
                {data.pagination.totalItems &&
                data.pagination.totalItems > data.products.length
                  ? `of ${data.pagination.totalItems}`
                  : ''}
                {' shown'}
              </Text>
            )}
          </PanelTop>
          <TabContent>
            {previewError && <ErrorMessage>Error: {previewError}</ErrorMessage>}

            {currentEditorTab === 0 && (
              <VisualEditor products={data.products} dispatch={dispatch} />
            )}
            {(currentEditorTab === 1 || rulesetType === 'global') && (
              <RulesetChanges
                merchandisingRules={merchandisingRules}
                dispatch={dispatch}
                isPinnable={rulesetType !== 'global'}
              />
            )}
          </TabContent>
        </RulesPanel>
      </MainContainerPanel>

      {isLoading && <Loader />}
    </>
  );
};
