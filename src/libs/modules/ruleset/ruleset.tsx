import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useContext, useEffect, useReducer, useState } from 'react';
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
import { CountrySelectorDropdown } from '@/libs/components/dropdowns/country-selector/country-selector';
import { Preview } from '@/libs/components/preview/preview';
import { ProductSearch } from '@/libs/components/product-search/product-search';
import { RulesetAttributes } from '@/libs/components/ruleset-attributes/ruleset-attributes';
import { RulesetChanges } from '@/libs/components/ruleset-changes/ruleset-changes';
import { Action } from '@/libs/components/types';
import { checkForDuplicates } from '@/libs/components/utils/check-for-duplicates';
import { VisualEditor } from '@/libs/components/visual-editor/visual-editor';
import { usePreview } from '@/libs/hooks';

import isEqual from 'lodash/isEqual';
import pluralize from 'pluralize';

import { rulesetReducer } from './reducer';

const CategoryPanel = styled.div<{
  rulesetType: 'global' | 'category' | 'search';
  hasIreland: boolean;
}>`
  border-top: 2px solid #005640;
  padding: ${spacing(1)};

  ${({ hasIreland }) =>
    !hasIreland &&
    css`
      display: flex;
    `};

  ${({ hasIreland, rulesetType }) =>
    hasIreland &&
    css`
      display: grid;
      grid-template-areas:
        'countryCode rulesetIdentifier'
        'duration duration';
      grid-template-columns: 240px auto;
      @media only screen and (min-width: 1200px) {
        grid-template-areas:
          'countryCode'
          'rulesetIdentifier'
          'duration';
        ${rulesetType === 'search' ||
        (rulesetType === 'global' &&
          /* istanbul ignore next */
          'grid-template-columns: 240px 490px 320px')};
        ${rulesetType === 'category' &&
        'grid-template-columns: 240px 730px 320px'};
      }
    `}
`;

const RulesetIdentifier = styled.div`
  grid-area: 'rulesetIdentifier';
  margin-right: ${spacing(2)};
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
  grid-area: 'countryCode';
`;

const InfluenceLabel = styled(Text)`
  margin-bottom: ${spacing(1)};
  line-height: 1.6rem;
`;

const Duration = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(1)};
  grid-area: 'duration';

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
  categoryIds,
  rulesetFacets,
  rulesetExcludedFacets,
  rulesetId,
  rulesetMerchandisingRules,
  rulesetType,
  searchTerms,
  startDate,
  countryCode,
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
    countryCode: countryCode || 'UK_IE',
  });

  const { rules: merchandisingRules } = ruleset;

  const featureFlags = useContext(FeatureFlagContext);

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
        />
      )}

      <ProductGridHeader
        canSave={
          !!selectedCategories.length ||
          !!rulesetSearchTerms.length ||
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

      <CategoryPanel
        rulesetType={rulesetType}
        hasIreland={featureFlags.hasIreland}
      >
        {featureFlags.hasIreland && (
          <InfluenceWrapper>
            <InfluenceLabel>Influence</InfluenceLabel>
            <CountrySelectorDropdown
              onChange={(country) =>
                dispatch({ type: 'changeCountry', payload: country })
              }
              selectedCountryCode={ruleset.countryCode}
            />
          </InfluenceWrapper>
        )}

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
                selectPreviewCategory={setPreviewValue}
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
                categoryId={selectedCategories[0]}
                searchTerms={rulesetSearchTerms}
              />
            )}
            {currentProductTab === 1 && (
              <RulesetAttributes
                merchandisingRules={merchandisingRules}
                category={selectedCategories[0]}
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
            {rulesetType !== 'global' && (
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
