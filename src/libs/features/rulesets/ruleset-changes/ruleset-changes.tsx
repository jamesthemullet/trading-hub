import type { Dispatch, ReactElement } from 'react';
import { useMemo } from 'react';
import { Skeleton } from '@mantine/core';

import type {
  MerchandisingCountryCode,
  MerchandisingProduct,
  MerchandisingRules,
  SearchMerchandisingProductsV1ParamsEnum,
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

import styles from './ruleset-changes.module.css';
import { useProductsLoader } from './use-products-loader';

const PRODUCTS_TO_LOAD_INCREMENT = 4;

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
  catalogue,
  onSelectAll,
  onSelectProduct,
  selectedProducts,
  selectedProductIds,
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
  catalogue?: SearchMerchandisingProductsV1ParamsEnum;
  onSelectAll: (args: string[]) => void;
  onSelectProduct: ({
    id,
    isSelected,
  }: {
    id: string;
    isSelected: boolean;
  }) => void;
  selectedProducts: string[];
  selectedProductIds: ReadonlySet<string>;
  isSelectionDisabled: boolean;
}) => {
  const {
    productDetails,
    missingProductDetails,
    productsShown,
    setProductsShown,
    isLoading,
  } = useProductsLoader({
    products,
    merchandisingRules,
    countryCode,
    catalogue,
  });

  const onSelectAllProducts = () => {
    const allProductIds = products.map(({ id }) => id);
    return selectedProducts.length === products.length
      ? onSelectAll([])
      : onSelectAll(allProductIds);
  };

  const renderProductOrPlaceholder = (
    id: string,
    index: number,
    product: MerchandisingProduct | undefined
  ): ReactElement => {
    if (product) {
      return (
        <Product
          {...product}
          index={index}
          isPinnable={isPinnable}
          pinnedProductsCount={pinnedProductsCount}
          dispatch={dispatch}
          isSelected={selectedProductIds.has(product.id)}
          isSelectionDisabled={isSelectionDisabled}
          onSelectProduct={onSelectProduct}
        />
      );
    }

    if (isLoading && !missingProductDetails.includes(id)) {
      return (
        <Skeleton
          key={id}
          aria-busy="true"
          data-testid="Product loader"
          width={235}
          height={320}
        />
      );
    }

    return (
      <MissingProduct
        index={index}
        id={id}
        dispatch={dispatch}
        isProductNumberEnabled
        changeType={changeType}
        isSelected={selectedProductIds.has(id)}
        isSelectionDisabled={isSelectionDisabled}
        onSelectProduct={onSelectProduct}
      />
    );
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
            shouldShowLabel
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
              {renderProductOrPlaceholder(id, index, product)}
            </div>
          );
        })}
      </section>

      {productsShown < products.length &&
        products.length > PRODUCTS_TO_LOAD_INCREMENT && (
          <div className={styles.buttonWrapper}>
            <Button
              onClick={() =>
                setProductsShown((current) =>
                  Math.min(
                    current + PRODUCTS_TO_LOAD_INCREMENT,
                    products.length
                  )
                )
              }
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
  catalogue?: SearchMerchandisingProductsV1ParamsEnum;

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
  catalogue,
  onSelectAll,
  onSelectProduct,
  selectedProducts,
  isSelectionDisabled,
}: RulesetChangesProps): ReactElement => {
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

  const selectedProductIds = useMemo(
    () => new Set(selectedProducts),
    [selectedProducts]
  );
  const hasSelectedProducts = selectedProducts.length > 0;
  const hasSelectedBlockedProduct = merchandisingRules.blockedProducts.some(
    (p) => selectedProductIds.has(p.id)
  );
  const hasSelectedBoostededProduct = merchandisingRules.boosts.product.some(
    (p) => selectedProductIds.has(p.id)
  );
  const hasSelectedBuriedProduct = merchandisingRules.buries.product.some((p) =>
    selectedProductIds.has(p.id)
  );
  const hasSelectedPinnedProduct = merchandisingRules.pinnedProducts.some((p) =>
    selectedProductIds.has(p.id)
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
          catalogue={catalogue}
          isSelectionDisabled={
            isSelectionDisabled ||
            (hasSelectedProducts && !hasSelectedBlockedProduct)
          }
          selectedProducts={selectedProducts}
          selectedProductIds={selectedProductIds}
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
          catalogue={catalogue}
          isSelectionDisabled={
            isSelectionDisabled ||
            (hasSelectedProducts && !hasSelectedPinnedProduct)
          }
          selectedProducts={selectedProducts}
          selectedProductIds={selectedProductIds}
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
          catalogue={catalogue}
          isSelectionDisabled={
            isSelectionDisabled ||
            (hasSelectedProducts && !hasSelectedBoostededProduct)
          }
          selectedProducts={selectedProducts}
          selectedProductIds={selectedProductIds}
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
          catalogue={catalogue}
          isSelectionDisabled={
            isSelectionDisabled ||
            (hasSelectedProducts && !hasSelectedBuriedProduct)
          }
          selectedProducts={selectedProducts}
          selectedProductIds={selectedProductIds}
          onSelectProduct={onSelectProduct}
          onSelectAll={onSelectAll}
        />
      )}
    </div>
  );
};
