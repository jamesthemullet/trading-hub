import type { MerchandisingRules, Product as ProductType } from '@/libs/api';
import styled from '@emotion/styled';
import { ChangeProductBoostBury, Product } from '../product/product';
import { Layout, ProductBox } from '../visual-editor/visual-editor.styles';
import { spacing } from '../utils/spacing';
import { ChangePositionTypes } from '../../modules/ruleset/ruleset';
import { Text } from '../typography/typography.styles';
import { NumericAttribute } from '../ruleset-attributes/numeric-attribute';
import { AlphanumericAttribute } from '../ruleset-attributes/alphanumeric-attribute';
import { useCategoryPreview } from '../../hooks';
import { useEffect } from 'react';

const Heading = styled(Text)`
  font-size: 20px;
  padding: ${spacing(2)} 0 0 ${spacing(2)};
`;

const ChangesRow = ({
  heading,
  onChangePosition,
  onProductBoostBury,
  pinnedProductsCount,
  products,
}: {
  heading: string;
  pinnedProductsCount: number;
  onChangePosition: (arg: ChangePositionTypes) => void;
  onProductBoostBury: (arg: ChangeProductBoostBury) => void;
  products: ProductType[];
}) => (
  <>
    <Heading as="h2" isStrong={true}>
      {heading}
    </Heading>

    <Layout>
      {products.map((product: ProductType, index: number) => (
        <ProductBox key={`product-${product.id}`}>
          <Product
            {...product}
            index={index}
            pinnedProductsCount={pinnedProductsCount}
            onChangePosition={onChangePosition}
            onProductBoostBury={onProductBoostBury}
          />
        </ProductBox>
      ))}
    </Layout>
  </>
);

export const RulesetChanges = ({
  category,
  merchandisingRules,
  onChangePosition,
  onProductBoostBury,
}: {
  category?: string;
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

  const { merchandisingRulesWithInfo, setRules } = useCategoryPreview(
    category,
    merchandisingRules
  );

  useEffect(() => {
    setRules(merchandisingRules);
  }, [merchandisingRules, setRules]);

  const pinnedProductsCount = merchandisingRules.pinnedProducts.length;

  return (
    <>
      {countOfAttributeChanges > 0 && (
        <>
          <Heading as="h2" isStrong={true}>
            Attribute-level changes ({countOfAttributeChanges})
          </Heading>
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
          <Layout>
            {alphanumericBoost.map(({ fields, weight }, index) => {
              return (
                <AlphanumericAttribute
                  key={`boost-alphanumeric-${index}`}
                  fields={fields}
                  operation="boost"
                  weight={weight}
                />
              );
            })}
          </Layout>
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
        </>
      )}
      {merchandisingRulesWithInfo &&
        merchandisingRulesWithInfo.pinnedProducts.length > 0 && (
          <ChangesRow
            heading={`Pinned Products (${merchandisingRules.pinnedProducts.length})`}
            products={merchandisingRulesWithInfo.pinnedProducts}
            pinnedProductsCount={pinnedProductsCount}
            onChangePosition={onChangePosition}
            onProductBoostBury={onProductBoostBury}
          />
        )}
      {/* TODO: when api is ready we can show products here */}
      {
        /* istanbul ignore next */
        merchandisingRulesWithInfo &&
          merchandisingRulesWithInfo.boosts.product.length > 0 && (
            <ChangesRow
              heading={`Boosted Products (${merchandisingRules.boosts.product.length})`}
              products={merchandisingRulesWithInfo.boosts.product}
              pinnedProductsCount={pinnedProductsCount}
              onChangePosition={onChangePosition}
              onProductBoostBury={onProductBoostBury}
            />
          )
      }
      {
        /* istanbul ignore next */
        merchandisingRulesWithInfo &&
          merchandisingRulesWithInfo.buries.product.length > 0 && (
            <ChangesRow
              heading={`Buried Products (${merchandisingRules.buries.product.length})`}
              products={merchandisingRulesWithInfo.buries.product}
              pinnedProductsCount={pinnedProductsCount}
              onChangePosition={onChangePosition}
              onProductBoostBury={onProductBoostBury}
            />
          )
      }
      {
        /* istanbul ignore next */
        merchandisingRulesWithInfo &&
          merchandisingRulesWithInfo.blockedProducts &&
          merchandisingRulesWithInfo.blockedProducts.length > 0 && (
            <ChangesRow
              heading={`Blocked Products (${merchandisingRules.blockedProducts.length})`}
              products={merchandisingRulesWithInfo.blockedProducts}
              pinnedProductsCount={pinnedProductsCount}
              onChangePosition={onChangePosition}
              onProductBoostBury={onProductBoostBury}
            />
          )
      }
    </>
  );
};
