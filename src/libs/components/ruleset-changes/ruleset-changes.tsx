import styled from '@emotion/styled';

import type {
  MerchandisingRules,
  MerchandisingRulesWithInfo,
  Product as ProductType,
} from '@/libs/api';

import { ChangePositionTypes } from '../../modules/ruleset/ruleset';
import { ChangeProductBoostBury, Product } from '../product/product';
import { AlphanumericAttribute } from '../ruleset-attributes/alphanumeric-attribute';
import { NumericAttribute } from '../ruleset-attributes/numeric-attribute';
import { Text } from '../typography/typography.styles';
import { spacing } from '../utils/spacing';
import { Layout, ProductBox } from '../visual-editor/visual-editor.styles';

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
    <Layout aria-label={heading.split('(')[0]}>
      {products.map((product: ProductType, index: number) => (
        <ProductBox key={`ruleset-changes-product-${product.id}`}>
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
  merchandisingRulesWithInfo,
  merchandisingRules,
  onChangePosition,
  onProductBoostBury,
}: {
  merchandisingRules: MerchandisingRules;
  merchandisingRulesWithInfo?: MerchandisingRulesWithInfo;
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
      {merchandisingRulesWithInfo &&
        merchandisingRulesWithInfo.pinnedProducts.length > 0 && (
          <ChangesRow
            heading={`Pinned Products (${merchandisingRulesWithInfo.pinnedProducts.length})`}
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
              heading={`Boosted Products (${merchandisingRulesWithInfo.boosts.product.length})`}
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
              heading={`Buried Products (${merchandisingRulesWithInfo.buries.product.length})`}
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
              heading={`Blocked Products (${merchandisingRulesWithInfo.blockedProducts.length})`}
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
