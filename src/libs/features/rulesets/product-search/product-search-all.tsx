import type { Dispatch } from 'react';
import { useCallback, useEffect, useState } from 'react';

import type {
  MerchandisingCountryCode,
  MerchandisingProduct as ProductType,
  MerchandisingRules,
} from '@/libs/api';
import { Checkbox } from '@/libs/components/checkboxes/checkbox';
import { Search } from '@/libs/components/search/search';
import type { RuleSetActions } from '@/libs/components/types';
import { Product } from '@/libs/containers/rulesets/product/product';
import { useCategoryProductSearch } from '@/libs/hooks';
import { DEBOUNCE_DELAY_MS } from '@/libs/hooks/utils/constants';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';

import pluralize from 'pluralize';

import styles from './product-search-all.module.css';

export type ProductSearchProps = {
  countryCode?: MerchandisingCountryCode;
  isSelectionDisabled: boolean;
  dispatch: Dispatch<RuleSetActions>;
  onSelectProduct: ({
    id,
    isSelected,
  }: {
    id: string;
    isSelected: boolean;
  }) => void;
  onSelectAll: (args: string[]) => void;
  selectedProducts: string[];
  isPinnable: boolean;
  merchandisingRules: MerchandisingRules;
  pinnedProductsCount: number;
  rulesetType: 'global' | 'category' | 'search';
  categoryIds?: string[];
  searchTerms?: string[];
};

export const ProductSearchAll = ({
  countryCode = 'UK_IE',
  dispatch,
  isPinnable,
  isSelectionDisabled,
  merchandisingRules,
  onSelectAll,
  onSelectProduct,
  selectedProducts,
  pinnedProductsCount,
  rulesetType,
  categoryIds,
  searchTerms,
}: ProductSearchProps) => {
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [products, setSearchProducts] = useState<ProductType[]>([]);
  const { searchForProduct } = useCategoryProductSearch();

  const fetchData = useCallback(async () => {
    const { products } = await searchForProduct({
      ...(categoryIds && {
        categories: categoryIds,
      }),
      ...(searchTerms && { searchTerms }),
      query: productSearchTerm,
      start: 0,
      rows: 400,
      merchandisingRules,
      countryCode,
    });

    setSearchProducts(products);
  }, [
    searchForProduct,
    searchTerms,
    productSearchTerm,
    categoryIds,
    merchandisingRules,
    countryCode,
  ]);

  useEffect(() => {
    if (productSearchTerm) {
      fetchData();
    }
  }, [productSearchTerm, fetchData]);

  const onSearch = (query: string) => {
    setProductSearchTerm(query.replace(/ *, */g, ', '));
    if (!query) {
      setSearchProducts([]);
    }
  };

  const { callback: handleSearch } = useDebounce((val: string) => {
    onSearch(val);
  }, DEBOUNCE_DELAY_MS);

  const onSelectAllProducts = () => {
    const allProductIds = products.map(({ id }) => id);
    return selectedProducts.length === products.length
      ? onSelectAll([])
      : onSelectAll(allProductIds);
  };

  return (
    <div
      className={styles.productSearchContainer}
      data-testid="Product Search Container"
    >
      <div className={styles.containerHeader} data-ruleset-type={rulesetType}>
        <div className={styles.topContainer}>
          <Search
            placeholder="Search for product"
            onChange={(e) => {
              handleSearch(e.target.value);
            }}
            fullWidth
          />
        </div>
        <div className={styles.infoContainer} data-ruleset-type={rulesetType}>
          {products.length > 0 && (
            <>
              <output aria-live="polite" aria-label="number of results">
                {products.length} {pluralize('results', products.length)}
              </output>
              <div className={styles.selectAll} data-ruleset-type={rulesetType}>
                <Checkbox
                  label="Select all"
                  onChange={onSelectAllProducts}
                  checked={
                    selectedProducts.length > 0 &&
                    selectedProducts.length === products.length
                  }
                  shouldShowLabel
                  disabled={isSelectionDisabled}
                />
              </div>
            </>
          )}
        </div>
      </div>
      <div
        className={styles.productsContainer}
        data-testid="product-search-result"
        data-ruleset-type={rulesetType}
      >
        {products.map((product, index) => {
          const id = `${product.id}-${index}`;
          const isSelected = selectedProducts.includes(product.id);
          return (
            <Product
              key={id}
              {...product}
              index={index}
              isPinnable={isPinnable}
              isSelectionDisabled={isSelectionDisabled}
              dispatch={dispatch}
              onSelectProduct={onSelectProduct}
              pinnedProductsCount={pinnedProductsCount}
              isBrandStrong={false}
              isProductNumberEnabled={false}
              isSearchResult
              isSelected={isSelected}
              hasSupplementaryInfo
              canSetBoostWeight={rulesetType === 'global'}
            />
          );
        })}
      </div>
    </div>
  );
};
