import styled from '@emotion/styled';

import type { Product as ProductType } from '@/libs/api';
import { useDebounce } from '@/libs/hooks/';

import { ChangeProductBoostBury, Product } from '../product/product';
import { Search } from '../search/search';
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

type ChangePositionTypes = {
  isPinned: boolean;
  id: string;
  newPosition: number;
};

export type ProductSearchProps = {
  isPinnable: boolean;
  onSearch: (query: string) => void;
  products: ProductType[];
  onChangePosition: (arg: ChangePositionTypes) => void;
  onProductBoostBury: (arg: ChangeProductBoostBury) => void;
};

export const ProductSearch = ({
  isPinnable,
  onSearch,
  products,
  onChangePosition,
  onProductBoostBury,
}: ProductSearchProps) => {
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
              onChangePosition={onChangePosition}
              onProductBoostBury={onProductBoostBury}
              pinnedProductsCount={0}
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
