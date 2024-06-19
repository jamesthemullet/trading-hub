import styled from '@emotion/styled';
import isEqual from 'lodash/isEqual';
import {
  CategorySearch,
  ChangeProductBoostBury,
  Preview,
  ProductGridHeader,
  ProductSearch,
  RulesetAttributes,
  RulesetChanges,
  spacing,
  Tabs,
  VisualEditor,
  Text,
  Loader,
  SelectedCategory,
} from '../../components';
import { useEffect, useState } from 'react';
import type {
  Category,
  Product,
  MerchandisingRules,
  AlphanumericBoostBury,
  NumericBoostBury,
  AttributeType,
  RuleSetFacetConfigWithId,
} from '@/libs/api';
import { useCategoryPreview, useCategoryProductSearch } from '../../hooks';
import { useRouter } from 'next/router';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pluralize = require('pluralize');

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

export type ChangePositionTypes = {
  isPinned: boolean;
  id: string;
  newPosition: number;
};

type NewRulesetValues = {
  isEnabled: boolean;
  categoryId: string;
  merchandisingRules: MerchandisingRules;
  facets?: Array<RuleSetFacetConfigWithId>;
};

interface EditRulesetValues extends NewRulesetValues {
  rulesetId: string;
}

export type EditAttribute = {
  attribute: AlphanumericBoostBury | NumericBoostBury;
  change: 'add' | 'remove' | 'modify';
  index?: number;
  operation: 'boosts' | 'buries' | 'block';
  type: AttributeType;
};

export const Ruleset = ({
  isEnabled,
  onCancel,
  onCreate,
  onSave,
  rulesetCategory,
  rulesetId,
  rulesetMerchandisingRules,
  rulesetType,
}: {
  isEnabled: boolean;
  onSave?: ({ rulesetId }: EditRulesetValues) => void;
  onCancel: () => void;
  onCreate?: ({ categoryId, merchandisingRules }: NewRulesetValues) => void;
  rulesetCategory?: Category;
  rulesetId?: string;
  rulesetMerchandisingRules?: MerchandisingRules;
  rulesetType: 'global' | 'category' | 'search';
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>(
    rulesetCategory || {}
  );
  const [currentEditorTab, setCurrentEditorTab] = useState(0);
  const [currentProductTab, setCurrentProductTab] = useState(0);
  const [merchandisingRules, setMerchandisingRules] =
    useState<MerchandisingRules>(
      rulesetMerchandisingRules || {
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
      }
    );
  const [hasChanges, setHasChanges] = useState(false);
  const { searchForProduct } = useCategoryProductSearch();
  const [searchProducts, setSearchProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState<number | undefined>(0);
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

  useEffect(() => {
    const fetchData = async () => {
      const data = await searchForProduct({
        categoryId: selectedCategory.identifier || '',
        query: '',
        start: 0,
        rows: 0,
        merchandisingRules,
      });
      setTotalProducts(data.pagination.totalItems);
    };

    fetchData();
  }, [searchForProduct, merchandisingRules, selectedCategory.identifier]);

  const onSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    if (!hasChanges) setHasChanges(true);
  };

  const {
    categoryProducts: sortedProducts,
    merchandisingRulesWithInfo,
    isLoading,
    setRules: setPreviewRules,
  } = useCategoryPreview(selectedCategory?.identifier, merchandisingRules);

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
  }: EditAttribute) => {
    /* istanbul ignore next */
    if (operation === 'block') return;

    let updatedState = { ...merchandisingRules };
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
    (merchandisingRules.buries?.product || []).length;

  const rulesPanelTabs = [
    ...(rulesetType === 'category' ? [{ title: 'Visual Editor' }] : []),
    {
      title: 'Changes',
      count: totalCount,
    },
  ];

  const onSaveRuleset = (categoryId: string) => {
    if (rulesetId && onSave) {
      onSave({
        facets: [], // TODO: send ruleset facet data
        isEnabled,
        rulesetId,
        merchandisingRules,
        categoryId,
      });
    } else if (onCreate) {
      onCreate({
        facets: [], // TODO: send ruleset facet data
        isEnabled,
        merchandisingRules,
        categoryId,
      });
    }
  };

  return (
    <>
      {showPreview && selectedCategory.identifier && (
        <Preview
          onClose={() => setShowPreview(!showPreview)}
          categoryId={selectedCategory.identifier}
          merchandisingRules={merchandisingRules}
        />
      )}

      <ProductGridHeader
        onSave={(categoryId) => {
          onSaveRuleset(categoryId);
          setHasChanges(false);
        }}
        categoryId={selectedCategory.identifier}
        hasPreview={!!selectedCategory?.identifier}
        onPreview={() => setShowPreview(!showPreview)}
        hasChanges={hasChanges}
        isNewRuleSet={!!onCreate}
        onCancel={() => {
          setHasChanges(false);
          onCancel();
        }}
        shouldHidePreview={rulesetType === 'global'}
      />

      {rulesetType === 'category' && (
        <CategoryPanel>
          <CategorySearch
            selectedCategory={selectedCategory}
            onClearSelection={() => {
              setSelectedCategory({});
            }}
            onSelectCategory={onSelectCategory}
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
          <TabContent>
            {currentProductTab === 0 && selectedCategory.identifier && (
              <ProductSearch
                onSearch={async (query) => {
                  /* istanbul ignore next */
                  if (!selectedCategory.identifier) {
                    return;
                  }
                  if (!query) {
                    setSearchProducts([]);
                    return;
                  }
                  const data = await searchForProduct({
                    categoryId: selectedCategory.identifier,
                    query,
                    start: 0,
                    rows: 10,
                    merchandisingRules,
                  });
                  setSearchProducts(data.products);
                }}
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
          </TabContent>
        </ProductSearchPanel>
        <RulesPanel>
          <PanelTop>
            <Tabs
              tabs={rulesPanelTabs}
              onTabChange={setCurrentEditorTab}
              currentTab={currentEditorTab}
            />
            <Text>
              {sortedProducts.length}{' '}
              {pluralize(' product', sortedProducts.length)}{' '}
              {totalProducts && totalProducts > sortedProducts.length
                ? `of ${totalProducts}`
                : ''}
              {' shown'}
            </Text>
          </PanelTop>
          <TabContent>
            {currentEditorTab === 0 && (
              <VisualEditor
                products={sortedProducts}
                onChangePosition={onChangePosition}
                onProductBoostBury={onProductBoostBury}
              />
            )}
            {currentEditorTab === 1 && (
              <RulesetChanges
                merchandisingRulesWithInfo={merchandisingRulesWithInfo}
                onChangePosition={onChangePosition}
                onProductBoostBury={onProductBoostBury}
              />
            )}
          </TabContent>
        </RulesPanel>
      </MainContainerPanel>

      {isLoading && <Loader />}
    </>
  );
};
