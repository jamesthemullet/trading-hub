import styled from '@emotion/styled';
import { useCallback, useEffect, useState } from 'react';

import type { MerchandisingRules, Product as ProductType } from '@/libs/api';
import { useCategoryProductSearch } from '@/libs/hooks';

import { ChangePositionTypes } from '../../modules/ruleset/ruleset';
import { Button } from '../buttons/button/button';
import {
  ChangeProductBoostBury,
  MissingProduct,
  Product,
} from '../product/product';
import { AlphanumericAttribute } from '../ruleset-attributes/alphanumeric-attribute';
import { NumericAttribute } from '../ruleset-attributes/numeric-attribute';
import { Text } from '../typography/typography.styles';
import { spacing } from '../utils/spacing';
import { Layout, ProductBox } from '../visual-editor/visual-editor.styles';

const Heading = styled(Text)`
  font-size: 20px;
  padding: ${spacing(2)} 0 0 ${spacing(2)};
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const PRODUCTS_TO_LOAD = 8;

type ProductRule = { id: string };

const ProductsLoader = ({
  changeType,
  heading,
  isPinnable,
  merchandisingRules,
  onChangePosition,
  onProductBoostBury,
  pinnedProductsCount,
  products,
}: {
  changeType: 'boost' | 'bury' | 'pin' | 'block';
  heading: string;
  isPinnable: boolean;
  merchandisingRules: MerchandisingRules;
  onChangePosition: (arg: ChangePositionTypes) => void;
  onProductBoostBury: (arg: ChangeProductBoostBury) => void;
  pinnedProductsCount: number;
  products: ProductRule[];
}) => {
  const [productDetails, setProductDetails] = useState<ProductType[]>([]);
  const [productsShown, setProductsShown] = useState(PRODUCTS_TO_LOAD);

  const { searchForProduct } = useCategoryProductSearch();

  const fetch = useCallback(
    async (productIds: string[]) => {
      const data = await searchForProduct({
        productIds,
        merchandisingRules,
      });
      return data.products;
    },
    [searchForProduct, merchandisingRules]
  );

  useEffect(() => {
    const fetchData = async () => {
      const productsToGet = [...products]
        .splice(0, productsShown)
        .map((product) => product.id);

      const data = await fetch(productsToGet);

      setProductDetails(data);
    };

    fetchData();
  }, [products, productsShown, fetch]);

  return (
    <>
      <Heading as="h2" isStrong={true}>
        {`${heading} (${products.length})`}
      </Heading>
      <Layout aria-label={heading.split('(')[0]}>
        {products.map(({ id }, index) => {
          if (index + 1 > productsShown) {
            return null;
          }
          const product = productDetails.find(
            ({ id: productId }) => id === productId
          );

          if (!product) {
            return (
              <ProductBox key={`ruleset-changes-product-${id}`}>
                <MissingProduct
                  index={index}
                  id={id}
                  onChangePosition={onChangePosition}
                  onProductBoostBury={onProductBoostBury}
                  isProductNumberEnabled={true}
                  isBlocked={changeType === 'block'}
                  isBuried={changeType === 'bury'}
                  isPinned={changeType === 'pin'}
                  isBoosted={changeType === 'boost'}
                />
              </ProductBox>
            );
          }

          return (
            <ProductBox key={`ruleset-changes-product-${id}`}>
              <Product
                {...product}
                index={index}
                isPinnable={isPinnable}
                pinnedProductsCount={pinnedProductsCount}
                onChangePosition={onChangePosition}
                onProductBoostBury={onProductBoostBury}
              />
            </ProductBox>
          );
        })}
      </Layout>
      {productsShown < products.length && products.length > 4 && (
        <ButtonWrapper>
          <Button
            style={{ width: 'auto' }}
            onClick={() => {
              setProductsShown(productsShown + 4);
            }}
          >
            Load more products
          </Button>
        </ButtonWrapper>
      )}
    </>
  );
};

export const RulesetChanges = ({
  isPinnable,
  merchandisingRules,
  onChangePosition,
  onProductBoostBury,
}: {
  isPinnable: boolean;
  merchandisingRules: MerchandisingRules;
  onChangePosition: (arg: ChangePositionTypes) => void;
  onProductBoostBury: (arg: ChangeProductBoostBury) => void;
}) => {
  /* istanbul ignore next */
  const countOfAttributeChanges =
    (merchandisingRules.boosts?.numeric?.length ?? 0) +
    (merchandisingRules.boosts?.alphanumeric?.length ?? 0) +
    (merchandisingRules.buries?.numeric?.length ?? 0) +
    (merchandisingRules.buries?.alphanumeric?.length ?? 0);
  /* istanbul ignore next */
  const numericBoosts = merchandisingRules.boosts?.numeric ?? [];
  /* istanbul ignore next */
  const alphanumericBoost = merchandisingRules.boosts?.alphanumeric ?? [];
  /* istanbul ignore next */
  const numericBury = merchandisingRules.buries?.numeric ?? [];
  /* istanbul ignore next */
  const alphanumericBuries = merchandisingRules.buries?.alphanumeric ?? [];

  const pinnedProductsCount = merchandisingRules.pinnedProducts.length;
  const blockedProductsCount = merchandisingRules.blockedProducts.length;
  const boostedProductsCount = merchandisingRules.boosts.product.length;
  const buriedProductsCount = merchandisingRules.buries.product.length;

  return (
    <>
      {countOfAttributeChanges > 0 && (
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
        </>
      )}

      {blockedProductsCount > 0 && (
        <ProductsLoader
          heading="Blocked Products"
          isPinnable={isPinnable}
          changeType="block"
          merchandisingRules={merchandisingRules}
          onChangePosition={onChangePosition}
          onProductBoostBury={onProductBoostBury}
          pinnedProductsCount={pinnedProductsCount}
          products={merchandisingRules.blockedProducts}
        />
      )}

      {pinnedProductsCount > 0 && (
        <ProductsLoader
          heading="Pinned Products"
          isPinnable={isPinnable}
          changeType="pin"
          merchandisingRules={merchandisingRules}
          onChangePosition={onChangePosition}
          onProductBoostBury={onProductBoostBury}
          pinnedProductsCount={pinnedProductsCount}
          products={merchandisingRules.pinnedProducts}
        />
      )}

      {boostedProductsCount > 0 && (
        <ProductsLoader
          heading="Boosted Products"
          isPinnable={isPinnable}
          changeType="boost"
          merchandisingRules={merchandisingRules}
          onChangePosition={onChangePosition}
          onProductBoostBury={onProductBoostBury}
          pinnedProductsCount={pinnedProductsCount}
          products={merchandisingRules.boosts.product}
        />
      )}

      {buriedProductsCount > 0 && (
        <ProductsLoader
          heading="Buried Products"
          isPinnable={isPinnable}
          changeType="bury"
          merchandisingRules={merchandisingRules}
          onChangePosition={onChangePosition}
          onProductBoostBury={onProductBoostBury}
          pinnedProductsCount={pinnedProductsCount}
          products={merchandisingRules.buries.product}
        />
      )}
    </>
  );
};
