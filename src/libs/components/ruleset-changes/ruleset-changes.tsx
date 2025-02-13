import styled from '@emotion/styled';
import { Dispatch, useCallback, useEffect, useState } from 'react';
import { Skeleton } from '@mantine/core';

import type {
  CountryCode,
  MerchandisingRules,
  Product as ProductType,
} from '@/libs/api';
import { useCategoryProductSearch } from '@/libs/hooks';

import { Button } from '../buttons/button/button';
import { Checkbox } from '../checkboxes/checkbox';
import { MissingProduct, Product } from '../product/product';
import { AlphanumericAttribute } from '../ruleset-attributes/alphanumeric-attribute';
import { NumericAttribute } from '../ruleset-attributes/numeric-attribute';
import { Action } from '../types';
import { Text } from '../typography/typography.styles';
import { spacing } from '../utils/spacing';
import { Layout, ProductBox } from '../visual-editor/visual-editor.styles';

export type ChangePositionTypes = {
  isPinned: boolean;
  id: string;
  newPosition: number;
};

const Heading = styled(Text)`
  font-size: 20px;
  padding: ${spacing(2)} 0 0 ${spacing(2)};
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const Header = styled.div`
  display: flex;
`;

const SelectAll = styled.div`
  padding: ${spacing(3)} 0 0 ${spacing(4)};
`;

const PRODUCTS_TO_LOAD = 8;
const PRODUCTS_TO_LOAD_INCREMENT = 4;
const MAXIMUM_PRODUCTS_TO_LOAD_BACKEND_SUPPORTS = 10;

type ProductRule = { id: string };

const ProductsLoader = ({
  changeType,
  dispatch,
  heading,
  isPinnable,
  merchandisingRules,
  pinnedProductsCount,
  products,
  countryCode = 'UK_IE',
  hasBulkAction,
  onSelectAll,
  onSelectProduct,
  selectedProducts,
  isSelectionDisabled,
}: {
  changeType: 'boost' | 'bury' | 'pin' | 'block';
  dispatch: Dispatch<Action>;
  heading: string;
  isPinnable: boolean;
  merchandisingRules: MerchandisingRules;
  pinnedProductsCount: number;
  products: ProductRule[];
  countryCode?: CountryCode;
  hasBulkAction: boolean;
  onSelectAll: (args: string[]) => void;
  onSelectProduct: ({
    id,
    isSelected,
  }: {
    id: string;
    isSelected: boolean;
  }) => void;
  selectedProducts: string[];
  isSelectionDisabled: boolean;
}) => {
  const [productDetails, setProductDetails] = useState<ProductType[]>([]);
  const [missingProductDetails, setMissingProductDetails] = useState<string[]>(
    []
  );
  const [productsShown, setProductsShown] = useState(PRODUCTS_TO_LOAD);

  const { searchForProduct, isLoading } = useCategoryProductSearch();

  const fetch = useCallback(
    async (productIds: string[]) => {
      const data = await searchForProduct({
        productIds,
        merchandisingRules,
        countryCode,
      });
      return data.products;
    },
    [searchForProduct, merchandisingRules, countryCode]
  );

  useEffect(() => {
    const fetchData = async () => {
      const productsToGet = [...products]
        .splice(0, productsShown)
        .filter(
          (product) => !productDetails.find(({ id }) => id === product.id)
        )
        .filter(
          (product) => !missingProductDetails.find((id) => id === product.id)
        )
        .map((product) => product.id);

      if (productsToGet.length === 0) {
        return;
      }

      const productsToFetch = productsToGet.slice(
        0,
        MAXIMUM_PRODUCTS_TO_LOAD_BACKEND_SUPPORTS
      );
      const data = await fetch(productsToFetch);

      const missingProducts = productsToFetch.filter((id) =>
        data.filter((x) => x.id.includes(id))
      );

      setMissingProductDetails((prev) => [...prev, ...missingProducts]);

      setProductDetails((prev) => [...prev, ...data]);
    };

    fetchData();
  }, [products, productsShown, fetch]);

  const onSelectAllProducts = () => {
    const allProductIds = products.map(({ id }) => id);
    return selectedProducts.length === products.length
      ? onSelectAll([])
      : onSelectAll(allProductIds);
  };

  return (
    <>
      <Header>
        <Heading as="h2" isStrong={true}>
          {`${heading} (${products.length})`}
        </Heading>

        {hasBulkAction && (
          <SelectAll>
            <Checkbox
              label="Select all"
              onChange={onSelectAllProducts}
              checked={
                selectedProducts.length > 0 &&
                selectedProducts.length === products.length
              }
              showLabel={true}
              disabled={isSelectionDisabled}
            />
          </SelectAll>
        )}
      </Header>
      <Layout aria-label={heading.split('(')[0]}>
        {products.map(({ id }, index) => {
          if (index + 1 > productsShown) {
            return null;
          }
          const product = productDetails.find(
            ({ id: productId }) => id === productId
          );

          return (
            <ProductBox key={`ruleset-changes-product-${id}`}>
              {!product ? (
                isLoading && !missingProductDetails.includes(id) ? (
                  <Skeleton
                    key={index}
                    aria-label="Product loader"
                    width={235}
                    height={320}
                  />
                ) : (
                  <MissingProduct
                    index={index}
                    id={id}
                    dispatch={dispatch}
                    isProductNumberEnabled={true}
                    isBlocked={changeType === 'block'}
                    isBuried={changeType === 'bury'}
                    isPinned={changeType === 'pin'}
                    isBoosted={changeType === 'boost'}
                    hasBulkAction={hasBulkAction}
                    isSelected={selectedProducts.includes(id)}
                    isSelectionDisabled={isSelectionDisabled}
                    onSelectProduct={onSelectProduct}
                  />
                )
              ) : (
                <Product
                  {...product}
                  index={index}
                  isPinnable={isPinnable}
                  pinnedProductsCount={pinnedProductsCount}
                  dispatch={dispatch}
                  hasBulkAction={hasBulkAction}
                  isSelected={selectedProducts.includes(product.id)}
                  isSelectionDisabled={isSelectionDisabled}
                  onSelectProduct={onSelectProduct}
                />
              )}
            </ProductBox>
          );
        })}
      </Layout>
      {productsShown < products.length &&
        products.length > PRODUCTS_TO_LOAD_INCREMENT && (
          <ButtonWrapper>
            <Button
              style={{ width: 'auto' }}
              onClick={() => {
                setProductsShown(productsShown + PRODUCTS_TO_LOAD_INCREMENT);
              }}
            >
              Load more products
            </Button>
          </ButtonWrapper>
        )}
    </>
  );
};

export type RulesetChangesProps = {
  isPinnable: boolean;
  merchandisingRules: MerchandisingRules;
  dispatch: Dispatch<Action>;
  countryCode?: CountryCode;
  hasBulkAction: boolean;
  onSelectAll: (args: string[]) => void;
  onSelectProduct: ({
    id,
    isSelected,
  }: {
    id: string;
    isSelected: boolean;
  }) => void;
  selectedProducts: string[];
  isSelectionDisabled: boolean;
};

export const RulesetChanges = ({
  isPinnable,
  merchandisingRules,
  dispatch,
  countryCode,
  hasBulkAction,
  onSelectAll,
  onSelectProduct,
  selectedProducts,
  isSelectionDisabled,
}: RulesetChangesProps) => {
  const countOfAttributeChanges =
    merchandisingRules.boosts.numeric.length +
    merchandisingRules.boosts.alphanumeric.length +
    merchandisingRules.buries.numeric.length +
    merchandisingRules.buries.alphanumeric.length +
    (merchandisingRules.includes.alphanumeric?.length ?? 0) +
    (merchandisingRules.excludes.alphanumeric?.length ?? 0);
  const numericBoosts = merchandisingRules.boosts.numeric;
  const alphanumericBoost = merchandisingRules.boosts.alphanumeric;
  const numericBury = merchandisingRules.buries.numeric;
  const alphanumericBuries = merchandisingRules.buries.alphanumeric;
  const alphanumericIncludes = merchandisingRules.includes.alphanumeric ?? [];
  const alphanumericExcludes = merchandisingRules.excludes.alphanumeric ?? [];

  const pinnedProductsCount = merchandisingRules.pinnedProducts.length;
  const blockedProductsCount = merchandisingRules.blockedProducts.length;
  const boostedProductsCount = merchandisingRules.boosts.product.length;
  const buriedProductsCount = merchandisingRules.buries.product.length;

  const hasAttributeChanges = countOfAttributeChanges > 0;

  const hasSelectedProducts = selectedProducts.length > 0;
  const hasSelectedBlockedProduct = merchandisingRules.blockedProducts.some(
    (p) => selectedProducts.includes(p.id)
  );
  const hasSelectedBoostededProduct = merchandisingRules.boosts.product.some(
    (p) => selectedProducts.includes(p.id)
  );
  const hasSelectedBuriedProduct = merchandisingRules.buries.product.some((p) =>
    selectedProducts.includes(p.id)
  );
  const hasSelectedPinnedProduct = merchandisingRules.pinnedProducts.some((p) =>
    selectedProducts.includes(p.id)
  );

  return (
    <>
      {hasAttributeChanges && (
        <>
          <Heading as="h2" isStrong={true}>
            Attribute-level changes ({countOfAttributeChanges})
          </Heading>
          {numericBoosts.length > 0 && (
            <Layout>
              {numericBoosts.map(({ field, weight }, index) => {
                return (
                  <NumericAttribute
                    key={`boost-numeric-${index}`}
                    name={field}
                    operation="boost"
                    weight={weight}
                  />
                );
              })}
            </Layout>
          )}
          {alphanumericBoost.length > 0 && (
            <Layout>
              {alphanumericBoost.map(({ fields, weight }, index) => (
                <AlphanumericAttribute
                  key={`boost-alphanumeric-${index}`}
                  fields={fields}
                  operation="boost"
                  weight={weight}
                />
              ))}
            </Layout>
          )}
          {numericBury.length > 0 && (
            <Layout>
              {numericBury.map(({ field, weight }, index) => {
                return (
                  <NumericAttribute
                    key={`bury-numeric-${index}`}
                    name={field}
                    operation="bury"
                    weight={weight}
                  />
                );
              })}
            </Layout>
          )}
          {alphanumericBuries.length > 0 && (
            <Layout>
              {alphanumericBuries.map(({ fields, weight }, index) => {
                return (
                  <AlphanumericAttribute
                    key={`bury-alphanumeric-${index}`}
                    fields={fields}
                    operation="bury"
                    weight={weight}
                  />
                );
              })}
            </Layout>
          )}
          {alphanumericIncludes.length > 0 && (
            <Layout>
              {alphanumericIncludes.map(({ fields }, index) => {
                return (
                  <AlphanumericAttribute
                    key={`include-alphanumeric-${index}`}
                    fields={fields}
                    operation="include"
                  />
                );
              })}
            </Layout>
          )}
          {alphanumericExcludes.length > 0 && (
            <Layout>
              {alphanumericExcludes.map(({ fields }, index) => {
                return (
                  <AlphanumericAttribute
                    key={`exclude-alphanumeric-${index}`}
                    fields={fields}
                    operation="exclude"
                  />
                );
              })}
            </Layout>
          )}
        </>
      )}

      {blockedProductsCount > 0 && (
        <ProductsLoader
          heading="Blocked Products"
          isPinnable={isPinnable}
          changeType="block"
          merchandisingRules={merchandisingRules}
          dispatch={dispatch}
          pinnedProductsCount={pinnedProductsCount}
          products={merchandisingRules.blockedProducts}
          countryCode={countryCode}
          hasBulkAction={hasBulkAction}
          isSelectionDisabled={
            isSelectionDisabled ||
            (hasSelectedProducts && !hasSelectedBlockedProduct)
          }
          selectedProducts={selectedProducts}
          onSelectProduct={onSelectProduct}
          onSelectAll={onSelectAll}
        />
      )}

      {pinnedProductsCount > 0 && (
        <ProductsLoader
          heading="Pinned Products"
          isPinnable={isPinnable}
          changeType="pin"
          merchandisingRules={merchandisingRules}
          dispatch={dispatch}
          pinnedProductsCount={pinnedProductsCount}
          products={merchandisingRules.pinnedProducts}
          countryCode={countryCode}
          hasBulkAction={hasBulkAction}
          isSelectionDisabled={
            isSelectionDisabled ||
            (hasSelectedProducts && !hasSelectedPinnedProduct)
          }
          selectedProducts={selectedProducts}
          onSelectProduct={onSelectProduct}
          onSelectAll={onSelectAll}
        />
      )}

      {boostedProductsCount > 0 && (
        <ProductsLoader
          heading="Boosted Products"
          isPinnable={isPinnable}
          changeType="boost"
          merchandisingRules={merchandisingRules}
          dispatch={dispatch}
          pinnedProductsCount={pinnedProductsCount}
          products={merchandisingRules.boosts.product}
          countryCode={countryCode}
          hasBulkAction={hasBulkAction}
          isSelectionDisabled={
            isSelectionDisabled ||
            (hasSelectedProducts && !hasSelectedBoostededProduct)
          }
          selectedProducts={selectedProducts}
          onSelectProduct={onSelectProduct}
          onSelectAll={onSelectAll}
        />
      )}

      {buriedProductsCount > 0 && (
        <ProductsLoader
          heading="Buried Products"
          isPinnable={isPinnable}
          changeType="bury"
          merchandisingRules={merchandisingRules}
          dispatch={dispatch}
          pinnedProductsCount={pinnedProductsCount}
          products={merchandisingRules.buries.product}
          countryCode={countryCode}
          hasBulkAction={hasBulkAction}
          isSelectionDisabled={
            isSelectionDisabled ||
            (hasSelectedProducts && !hasSelectedBuriedProduct)
          }
          selectedProducts={selectedProducts}
          onSelectProduct={onSelectProduct}
          onSelectAll={onSelectAll}
        />
      )}
    </>
  );
};
