import styled from '@emotion/styled';
import type { Product as ProductType } from '@/libs/api';

import { Product } from '../product/product';
import { Search } from '../search/search';

const ProductSearchRootContainer = styled.div`
  padding-left: 8px;
  padding-right: 8px;
  padding-top: 20px;
`;

const TopContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 9px;
  align-items: stretch;
`;

// not for 1st phase
// const UploadButton = styled(Button)`
//   padding: 5px;
//   width: 39px;
//   height: 53px;
//   padding-left: 5px;
//   padding-top: 10px;
// `;

const StyledSearch = styled(Search)`
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
  gap: 1%;

  & > div {
    margin: 0;
    flex-basis: 49%;
    margin-top: 5px;
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
  onSearch: (query: string) => void;
  products: ProductType[];
  onChangePosition: (arg: ChangePositionTypes) => void;
};

export const ProductSearch = ({
  onSearch,
  products,
  onChangePosition,
}: ProductSearchProps) => {
  return (
    <ProductSearchRootContainer aria-label="Product Search Container">
      <TopContainer>
        <StyledSearch
          placeholder="Search for product"
          onChange={(e) => {
            onSearch(e.target.value);
          }}
        />
        {/* <UploadButton href="#">
          <UploadFileIcon />
        </UploadButton> */}
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
              onChangePosition={onChangePosition}
              totalProducts={products.length}
              pinnedProductsCount={0}
              isBrandStrong={false}
              isProductNumberEnabled={false}
            />
          );
        })}
      </ProductsContainer>
    </ProductSearchRootContainer>
  );
};
