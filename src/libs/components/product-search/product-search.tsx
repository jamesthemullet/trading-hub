import styled from '@emotion/styled';
import { Dispatch, useState } from 'react';
import { Skeleton } from '@mantine/core';

import type { CountryCode, MerchandisingRules } from '@/libs/api';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';

import { Product } from '../product/product';
import { Search } from '../search/search';
import { Action } from '../types';
import { spacing } from '../utils/spacing';
import { useProducts } from './use-products';

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
  categoryIds?: string[];
  searchTerms?: string[];
  maxToQuery?: number;
  countryCode?: CountryCode;
};

export const ProductSearch = ({
  categoryIds,
  countryCode,
  dispatch,
  isPinnable,
  maxToQuery = 10,
  merchandisingRules,
  pinnedProductsCount,
  searchTerms,
}: ProductSearchProps) => {
  const [productSearchTerm, setProductSearchTerm] = useState('');

  const { products, totalProducts, scrollContainerRef, clearProducts } =
    useProducts({
      productSearchTerm,
      categoryIds,
      searchTerms,
      maxToQuery,
      merchandisingRules,
      countryCode,
    });

  const onSearch = (query: string) => {
    setProductSearchTerm(query);
    if (!query) {
      clearProducts();
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
      <InfoContainer>{totalProducts} results</InfoContainer>
      <ProductsContainer
        ref={scrollContainerRef}
        data-testid="product-search-result"
      >
        {products.map((productWrapper, index) => {
          const id = `${productWrapper.id}`;
          return productWrapper.type === 'product' ? (
            <StyledProduct
              key={productWrapper.product.id}
              {...productWrapper.product}
              hasBulkAction={false}
              index={index}
              isPinnable={isPinnable}
              dispatch={dispatch}
              pinnedProductsCount={pinnedProductsCount}
              isBrandStrong={false}
              isProductNumberEnabled={false}
              isSearchResult={true}
              isSelected={false}
              isSelectionDisabled
            />
          ) : (
            <Skeleton key={id} aria-label={id} w={'100%'} h={'200px'} />
          );
        })}
      </ProductsContainer>
    </ProductSearchRootContainer>
  );
};
