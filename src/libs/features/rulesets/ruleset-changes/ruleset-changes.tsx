import type { Dispatch } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Skeleton } from '@mantine/core';

import type {
  MerchandisingCountryCode,
  MerchandisingProduct as ProductType,
  MerchandisingRules,
} from '@/libs/api';
import { Button, Typography } from '@/libs/components';
import { Checkbox } from '@/libs/components/checkboxes/checkbox';
import { AlphanumericAttribute } from '@/libs/components/ruleset-attributes/alphanumeric-attribute';
import { NumericAttribute } from '@/libs/components/ruleset-attributes/numeric-attribute';
import type { RuleSetActions } from '@/libs/components/types';
import {
  MissingProduct,
  Product,
} from '@/libs/containers/rulesets/product/product';
import { useCategoryProductSearch } from '@/libs/hooks';

import styles from './ruleset-changes.module.css';

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
  onSelectAll,
  onSelectProduct,
  selectedProducts,
  isSelectionDisabled,
}: {
  changeType: 'boost' | 'bury' | 'pin' | 'block';
  dispatch: Dispatch<RuleSetActions>;
  heading: string;
  isPinnable: boolean;
  merchandisingRules: MerchandisingRules;
  pinnedProductsCount: number;
  products: ProductRule[];
  countryCode?: MerchandisingCountryCode;
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
  }, [products, productsShown, missingProductDetails, productDetails, fetch]);

  const onSelectAllProducts = () => {
    const allProductIds = products.map(({ id }) => id);
    return selectedProducts.length === products.length
      ? onSelectAll([])
      : onSelectAll(allProductIds);
  };

  return (
    <section className={styles.changeSection}>
      <div className={styles.header}>
        <Typography as="h2" isStrong variant="titleSmall">
          {`${heading} (${products.length})`}
        </Typography>

        <div className={styles.selectAll}>
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
        </div>
      </div>
      <section className={styles.layout} data-testid={heading.split('(')[0]}>
        {products.map(({ id }, index) => {
          if (index + 1 > productsShown) {
            return null;
          }
          const product = productDetails.find(
            ({ id: productId }) => id === productId
          );

          return (
            <div
              className={styles.productBox}
              key={`ruleset-changes-product-${id}`}
            >
              {!product ? (
                isLoading && !missingProductDetails.includes(id) ? (
                  <Skeleton
                    key={id}
                    aria-busy="true"
                    data-testid="Product loader"
                    width={235}
                    height={320}
                  />
                ) : (
                  <MissingProduct
                    index={index}
                    id={id}
                    dispatch={dispatch}
                    isProductNumberEnabled
                    isBlocked={changeType === 'block'}
                    isBuried={changeType === 'bury'}
                    isPinned={changeType === 'pin'}
                    isBoosted={changeType === 'boost'}
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
                  isSelected={selectedProducts.includes(product.id)}
                  isSelectionDisabled={isSelectionDisabled}
                  onSelectProduct={onSelectProduct}
                />
              )}
            </div>
          );
        })}
      </section>

      {productsShown < products.length &&
        products.length > PRODUCTS_TO_LOAD_INCREMENT && (
          <div className={styles.buttonWrapper}>
            <Button
              onClick={() => {
                setProductsShown(productsShown + PRODUCTS_TO_LOAD_INCREMENT);
              }}
            >
              Load more products
            </Button>
          </div>
        )}
    </section>
  );
};

export type RulesetChangesProps = {
  isPinnable: boolean;
  merchandisingRules: MerchandisingRules;
  dispatch: Dispatch<RuleSetActions>;
  countryCode?: MerchandisingCountryCode;

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
    <div className={styles.rulesetChangesWrapper}>
      {hasAttributeChanges && (
        <section className={styles.changeSection}>
          <Typography as="h2" isStrong variant="titleSmall">
            Attribute-level changes ({countOfAttributeChanges})
          </Typography>
          {numericBoosts.length > 0 &&
            numericBoosts.map(({ field, weight }) => {
              return (
                <NumericAttribute
                  key={`boost-numeric-${field}`}
                  name={field}
                  operation="boost"
                  weight={weight}
                />
              );
            })}
          {alphanumericBoost.length > 0 &&
            alphanumericBoost.map(({ fields, weight }) => (
              <AlphanumericAttribute
                key={`boost-alphanumeric-${fields.join('-')}`}
                fields={fields}
                operation="boost"
                weight={weight}
              />
            ))}
          {numericBury.length > 0 &&
            numericBury.map(({ field, weight }) => {
              return (
                <NumericAttribute
                  key={`bury-numeric-${field}`}
                  name={field}
                  operation="bury"
                  weight={weight}
                />
              );
            })}
          {alphanumericBuries.length > 0 &&
            alphanumericBuries.map(({ fields, weight }) => {
              return (
                <AlphanumericAttribute
                  key={`bury-alphanumeric-${fields.join('-')}`}
                  fields={fields}
                  operation="bury"
                  weight={weight}
                />
              );
            })}
          {alphanumericIncludes.length > 0 &&
            alphanumericIncludes.map(({ fields }) => {
              return (
                <AlphanumericAttribute
                  key={`include-alphanumeric-${fields.join('-')}`}
                  fields={fields}
                  operation="include"
                />
              );
            })}
          {alphanumericExcludes.length > 0 &&
            alphanumericExcludes.map(({ fields }) => {
              return (
                <AlphanumericAttribute
                  key={`exclude-alphanumeric-${fields.join('-')}`}
                  fields={fields}
                  operation="exclude"
                />
              );
            })}
        </section>
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
          isSelectionDisabled={
            isSelectionDisabled ||
            (hasSelectedProducts && !hasSelectedBuriedProduct)
          }
          selectedProducts={selectedProducts}
          onSelectProduct={onSelectProduct}
          onSelectAll={onSelectAll}
        />
      )}
    </div>
  );
};
