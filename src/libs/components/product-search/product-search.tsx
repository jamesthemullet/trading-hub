import styled from '@emotion/styled';
import { Dispatch, useCallback, useEffect, useState } from 'react';

import type { MerchandisingRules, Product as ProductType } from '@/libs/api';
import { useCategoryProductSearch } from '@/libs/hooks';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';

import { Product } from '../product/product';
import { Search } from '../search/search';
import { Action } from '../types';
import { spacing } from '../utils/spacing';

const ProductSearchRootContainer = styled.div`
  padding-top: ${spacing(2.5)};
`;

const TopContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 9px;
  align-items: stretch;
`;

const StyledSearch = styled(Search)`
  width: 100%;
  & > div {
    & > input {
      height: 53px;
    }
  }
`;

const ProductsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 0;
  height: calc(100vh - 395px);
  overflow: auto;
  gap: 5px;

  & > div {
    margin: 0;
    flex: calc(50% - 10px);
    min-height: auto;
  }
`;

const StyledProduct = styled(Product)`
  width: 100%;
`;

const InfoContainer = styled.div`
  display: flex;
  height: 34px;
  align-items: center;
`;

export type ProductSearchProps = {
  dispatch: Dispatch<Action>;
  isPinnable: boolean;
  merchandisingRules: MerchandisingRules;
  pinnedProductsCount: number;
  categoryId?: string;
};

export const ProductSearch = ({
  dispatch,
  isPinnable,
  merchandisingRules,
  pinnedProductsCount,
  categoryId,
}: ProductSearchProps) => {
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [products, setSearchProducts] = useState<ProductType[]>([]);
  const { searchForProduct } = useCategoryProductSearch();

  const fetchData = useCallback(async () => {
    const { products } = await searchForProduct({
      ...(categoryId && {
        categoryId,
      }),
      query: productSearchTerm,
      start: 0,
      rows: 10,
      merchandisingRules,
    });

    setSearchProducts(products);
  }, [searchForProduct, productSearchTerm, categoryId, merchandisingRules]);

  useEffect(() => {
    if (productSearchTerm) {
      fetchData();
    }
  }, [productSearchTerm, fetchData]);

  const onSearch = (query: string) => {
    setProductSearchTerm(query);
    if (!query) {
      setSearchProducts([]);
    }
  };

  const { callback: handleSearch } = useDebounce((val: string) => {
    onSearch(val);
  }, 300);

  return (
    <ProductSearchRootContainer aria-label="Product Search Container">
      <TopContainer>
        <StyledSearch
          placeholder="Search for product"
          onChange={(e) => {
            handleSearch(e.target.value);
          }}
        />
      </TopContainer>
      <InfoContainer>{products.length} results</InfoContainer>
      <ProductsContainer>
        {products.map((product, index) => {
          const id = `${product.id}-${index}`;
          return (
            <StyledProduct
              key={id}
              {...product}
              index={index}
              isPinnable={isPinnable}
              dispatch={dispatch}
              pinnedProductsCount={pinnedProductsCount}
              isBrandStrong={false}
              isProductNumberEnabled={false}
              isSearchResult={true}
            />
          );
        })}
      </ProductsContainer>
    </ProductSearchRootContainer>
  );
};
