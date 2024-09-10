import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import type {
  AlphanumericBoostBury,
  Category,
  CategoryRuleSet,
  KeywordRuleSet,
  MerchandisingRules,
  NumericBoostBury,
  Product,
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
import { Preview } from '@/libs/components/preview/preview';
import { ChangeProductBoostBury } from '@/libs/components/product/product';
import { ProductSearch } from '@/libs/components/product-search/product-search';
import { RulesetAttributes } from '@/libs/components/ruleset-attributes/ruleset-attributes';
import { RulesetChanges } from '@/libs/components/ruleset-changes/ruleset-changes';
import { RulesetAttribute } from '@/libs/components/types';
import { VisualEditor } from '@/libs/components/visual-editor/visual-editor';
import { useCategoryProductSearch, usePreview } from '@/libs/hooks';

import isEqual from 'lodash/isEqual';
import pluralize from 'pluralize';

const CategoryPanel = styled.div`
  border-top: 2px solid #005640;
  padding: ${spacing(1)};
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

export type ChangePositionTypes = {
  isPinned: boolean;
  id: string;
  newPosition: number;
};

export const Ruleset = ({
  isEnabled,
  onCancel,
  onCreate,
  onCreateKeywordSearchRuleset,
  onSave,
  rulesetCategory,
  rulesetFacets,
  rulesetId,
  rulesetMerchandisingRules,
  rulesetType,
  searchTerms,
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
  onCreate?: (args: CategoryRuleSet) => void;
  onCreateKeywordSearchRuleset?: (args: KeywordRuleSet) => void;
  rulesetCategory?: Category;
  rulesetFacets?: Array<RuleSetFacetConfigWithId>;
  rulesetId?: string;
  rulesetMerchandisingRules?: MerchandisingRules;
  rulesetType: 'global' | 'category' | 'search';
  searchTerms?: string[];
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>(
    rulesetCategory || {}
  );
  const [rulesetSearchTerms, setRulesetSearchTerms] = useState(
    searchTerms || []
  );
  const [currentEditorTab, setCurrentEditorTab] = useState(0);
  const [currentProductTab, setCurrentProductTab] = useState(0);
  const [merchandisingRules, setMerchandisingRules] =
    useState<MerchandisingRules>(
      rulesetMerchandisingRules
        ? rulesetMerchandisingRules
        : {
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
          }
    );
  const [hasChanges, setHasChanges] = useState(false);
  const { searchForProduct } = useCategoryProductSearch();
  const [searchProducts, setSearchProducts] = useState<Product[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const warningText =
      'You have unsaved changes - are you sure you wish to leave this page?';
    /* istanbul ignore next */
    const handleWindowClose = (e: BeforeUnloadEvent) => {
      if (!hasChanges) return;
      e.preventDefault();
      return warningText;
    };
    /* istanbul ignore next */
    const handleBrowseAway = () => {
      if (!hasChanges) return;
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

  const onSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    if (!hasChanges) setHasChanges(true);
  };

  const {
    data,
    error: previewError,
    isLoading,
    setRules: setPreviewRules,
  } = usePreview({
    ...(selectedCategory && { categoryId: selectedCategory.identifier }),
    ...(rulesetSearchTerms && { searchTerm: rulesetSearchTerms[0] }),
    merchandisingRules,
    facetConfig: [],
    previewType: rulesetType === 'category' ? 'category' : 'all',
  });

  const onAddSearchTerm = (keyword: string) => {
    setRulesetSearchTerms([...rulesetSearchTerms, keyword]);
  };
  const onRemoveSearchTerm = (keyword: string) => {
    setRulesetSearchTerms(
      rulesetSearchTerms.filter((term) => term !== keyword)
    );
  };

  const onChangePosition = ({
    isPinned,
    newPosition,
    id,
  }: ChangePositionTypes) => {
    const pinnedProducts = merchandisingRules.pinnedProducts.filter(
      (product) => product.id !== id
    );

    // istanbul ignore next
    const updatedPinnedProducts = isPinned
      ? [
          ...pinnedProducts.slice(0, newPosition),
          { id },
          ...pinnedProducts.slice(newPosition),
        ]
      : pinnedProducts;
    const updatedMerchRules = {
      ...merchandisingRules,
      pinnedProducts: updatedPinnedProducts,
      boosts: {
        ...merchandisingRules.boosts,
        product: merchandisingRules.boosts.product.filter(
          (product) => product.id !== id
        ),
      },
      buries: {
        ...merchandisingRules.buries,
        product: merchandisingRules.buries.product.filter(
          // istanbul ignore next
          (product) => product.id !== id
        ),
      },
      blockedProducts: merchandisingRules.blockedProducts.filter(
        // istanbul ignore next
        (product) => product.id !== id
      ),
    };
    setMerchandisingRules(updatedMerchRules);
    setPreviewRules(updatedMerchRules);
    if (!hasChanges) setHasChanges(true);
  };

  const onChangeAttribute = ({
    attribute,
    change,
    index,
    operation,
    type,
  }: RulesetAttribute) => {
    let updatedState = { ...merchandisingRules };

    if (operation === 'boosts' || operation === 'buries') {
      setMerchandisingRules((prevState) => {
        if (change === 'modify') {
          updatedState = {
            ...prevState,
            [operation]: {
              ...prevState[operation],
              [type]: prevState[operation][type].map((attr, attributeIndex) => {
                if (attributeIndex === index) {
                  return attribute;
                }
                return attr;
              }),
            },
          };
          return updatedState;
        }
        if (type === 'alphanumeric') {
          updatedState = {
            ...prevState,
            [operation]: {
              ...prevState[operation],
              alphanumeric:
                change === 'add'
                  ? [
                      ...merchandisingRules[operation][type],
                      attribute as AlphanumericBoostBury,
                    ]
                  : [
                      ...merchandisingRules[operation][type].filter(
                        (attr) => !isEqual(attr, attribute)
                      ),
                    ],
            },
          };
          return updatedState;
        }
        if (type === 'numeric') {
          updatedState = {
            ...prevState,
            [operation]: {
              ...prevState[operation],
              numeric:
                change === 'add'
                  ? [
                      ...merchandisingRules[operation][type],
                      attribute as NumericBoostBury,
                    ]
                  : merchandisingRules[operation][type].filter(
                      (attr) => !isEqual(attr, attribute)
                    ),
            },
          };
          return updatedState;
        }
        /* istanbul ignore next */
        return updatedState;
      });
    }

    if (operation === 'includes' || operation === 'excludes') {
      setMerchandisingRules((prevState) => {
        updatedState = {
          ...prevState,
          [operation]: {
            alphanumeric:
              change === 'add'
                ? [...(prevState[operation].alphanumeric || []), attribute]
                : [
                    ...(
                      prevState[operation].alphanumeric ||
                      // istanbul ignore next
                      []
                    ).filter((attr) => !isEqual(attr, attribute)),
                  ],
          },
        };
        return updatedState;
      });
    }

    setPreviewRules(updatedState);
  };

  const onProductBoostBury = ({
    id,
    operation,
    change,
  }: ChangeProductBoostBury) => {
    const isBoosted = change === 'add' && operation === 'boosts';
    const isBuried = change === 'add' && operation === 'buries';
    const isBlocked = change === 'add' && operation === 'block';

    const productBoosts = isBoosted
      ? [...merchandisingRules.boosts.product, { id, weight: 100 }]
      : merchandisingRules.boosts.product.filter(
          (product) => product.id !== id
        );
    const productBuries = isBuried
      ? [...merchandisingRules.buries.product, { id, weight: 100 }]
      : merchandisingRules.buries.product.filter(
          (product) => product.id !== id
        );

    const updatedRules: MerchandisingRules = {
      ...merchandisingRules,
      boosts: {
        ...merchandisingRules.boosts,
        product: productBoosts,
      },
      buries: {
        ...merchandisingRules.buries,
        product: productBuries,
      },
      pinnedProducts: merchandisingRules.pinnedProducts.filter(
        (product) => product.id !== id
      ),
      blockedProducts: isBlocked
        ? [...merchandisingRules.blockedProducts, { id }]
        : merchandisingRules.blockedProducts.filter(
            (product) => product.id !== id
          ),
    };

    setMerchandisingRules(updatedRules);
    setPreviewRules(updatedRules);

    if (!hasChanges) setHasChanges(true);
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
        },
        ...(selectedCategory.identifier && {
          categoryIds: [selectedCategory.identifier],
        }),
        ...(rulesetSearchTerms && {
          searchTerms: rulesetSearchTerms,
        }),
      });
    } else if (onCreate && selectedCategory.identifier) {
      onCreate({
        facets: [],
        isEnabled,
        rules: merchandisingRules,
        categoryId: selectedCategory.identifier,
      });
    } else if (onCreateKeywordSearchRuleset && rulesetSearchTerms.length) {
      onCreateKeywordSearchRuleset({
        isEnabled,
        rules: merchandisingRules,
        searchTerms: rulesetSearchTerms,
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
        hasChanges={hasChanges}
        isNewRuleSet={!!onCreate || !!onCreateKeywordSearchRuleset}
        onCancel={() => {
          setHasChanges(false);
          onCancel();
        }}
        shouldHidePreview={rulesetType === 'global'}
        title="Product Grid"
      />

      {rulesetType === 'category' && (
        <CategoryPanel>
          <CategorySearch
            selectedCategory={selectedCategory}
            onClearSelection={() => {
              setSelectedCategory({});
            }}
            onSelectCategory={onSelectCategory}
            canRemoveCategory={true}
          />
        </CategoryPanel>
      )}

      {rulesetType === 'search' && (
        <CategoryPanel>
          <SearchKeywords
            title="Search Keywords"
            searchTerms={rulesetSearchTerms}
            addSearchTerm={onAddSearchTerm}
            removeSearchTerm={onRemoveSearchTerm}
          />
        </CategoryPanel>
      )}

      {rulesetType === 'global' && (
        <CategoryPanel>
          <SelectedCategory label="All pages" />
        </CategoryPanel>
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
                onSearch={async (query) => {
                  if (!query) {
                    setSearchProducts([]);
                    return;
                  }
                  const data = await searchForProduct({
                    ...(selectedCategory.identifier && {
                      categoryId: selectedCategory.identifier,
                    }),
                    query,
                    start: 0,
                    rows: 10,
                    merchandisingRules,
                  });
                  setSearchProducts(data.products);
                }}
                pinnedProductsCount={merchandisingRules.pinnedProducts.length}
                onChangePosition={onChangePosition}
                onProductBoostBury={onProductBoostBury}
                products={searchProducts}
              />
            )}
            {currentProductTab === 1 && (
              <RulesetAttributes
                merchandisingRules={merchandisingRules}
                category={selectedCategory.identifier}
                onChangeAttribute={onChangeAttribute}
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
              <VisualEditor
                products={data.products}
                onChangePosition={onChangePosition}
                onProductBoostBury={onProductBoostBury}
              />
            )}
            {(currentEditorTab === 1 || rulesetType === 'global') && (
              <RulesetChanges
                merchandisingRules={merchandisingRules}
                onChangePosition={onChangePosition}
                onProductBoostBury={onProductBoostBury}
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
