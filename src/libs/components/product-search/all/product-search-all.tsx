import styled from '@emotion/styled';
import type { Dispatch } from 'react';
import { useCallback, useEffect, useState } from 'react';

import type {
  MerchandisingCountryCode,
  MerchandisingProduct as ProductType,
  MerchandisingRules,
} from '@/libs/api';
import { useCategoryProductSearch } from '@/libs/hooks';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';

import pluralize from 'pluralize';

import { Checkbox } from '../../checkboxes/checkbox';
import { Product } from '../../product/product';
import { Search } from '../../search/search';
import type { RuleSetActions } from '../../types';
import { spacing } from '../../utils/spacing';

const ProductSearchRootContainer = styled.div`
  height: 100%;
`;
const TopContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 9px;
  align-items: stretch;
`;
const StyledSearch = styled(Search)<{
  rulesetType: 'global' | 'category' | 'search';
}>`
  width: ${(props) => (props.rulesetType === 'global' ? '336px' : '100%')};
  max-width: 360px;
  & > div {
    & > input {
      height: 53px;
    }
  }
`;

const ProductsContainer = styled.div<{
  rulesetType: 'global' | 'category' | 'search';
}>`
  display: flex;
  flex-wrap: wrap;
  padding: 0;
  height: 100%;
  padding-bottom: 108px;
  overflow: auto;
  gap: 5px;
  & > div {
    margin: 0;
    flex: ${(props) => props.rulesetType !== 'global' && 'calc(50% - 10px)'};
    min-height: auto;
    max-width: ${(props) => props.rulesetType === 'global' && '322px'};
  }
`;

const StyledProduct = styled(Product)`
  width: 100%;
`;

const InfoContainer = styled.div<{
  rulesetType: 'global' | 'category' | 'search';
}>`
  display: flex;
  height: 34px;
  align-items: center;

  flex-direction: ${(props) =>
    props.rulesetType === 'global' && 'column-reverse'};
  align-items: ${(props) => props.rulesetType === 'global' && 'flex-end'};
  justify-content: flex-end;
  gap: 10px;
`;

const SelectAll = styled.div<{
  rulesetType: 'global' | 'category' | 'search';
}>`
  margin-left: auto;
  display: flex;
  height: 34px;
  align-items: center;

  align-items: ${(props) => props.rulesetType === 'global' && 'flex-end'};
`;

const ContainerHeader = styled.div<{
  rulesetType: 'global' | 'category' | 'search';
}>`
  display: ${(props) => props.rulesetType === 'global' && 'flex'};
  flex-direction: row;
  justify-content: space-between;
  margin: ${(props) =>
    props.rulesetType === 'global' && `${spacing(1)} 0 ${spacing(3)}`};
`;

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
  }, 300);

  const onSelectAllProducts = () => {
    const allProductIds = products.map(({ id }) => id);
    return selectedProducts.length === products.length
      ? onSelectAll([])
      : onSelectAll(allProductIds);
  };

  return (
    <ProductSearchRootContainer data-testid="Product Search Container">
      <ContainerHeader rulesetType={rulesetType}>
        <TopContainer>
          <StyledSearch
            rulesetType={rulesetType}
            placeholder="Search for product"
            onChange={(e) => {
              handleSearch(e.target.value);
            }}
          />
        </TopContainer>
        <InfoContainer rulesetType={rulesetType}>
          {products.length > 0 && (
            <>
              {products.length} {pluralize('results', products.length)}
              <SelectAll rulesetType={rulesetType}>
                <Checkbox
                  label="Select all"
                  onChange={onSelectAllProducts}
                  checked={
                    selectedProducts.length > 0 &&
                    selectedProducts.length === products.length
                  }
                  showLabel
                  disabled={isSelectionDisabled}
                />
              </SelectAll>
            </>
          )}
        </InfoContainer>
      </ContainerHeader>
      <ProductsContainer
        data-testid="product-search-result"
        rulesetType={rulesetType}
      >
        {products.map((product, index) => {
          const id = `${product.id}-${index}`;
          const isSelected = selectedProducts.includes(product.id);
          return (
            <StyledProduct
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
            />
          );
        })}
      </ProductsContainer>
    </ProductSearchRootContainer>
  );
};
