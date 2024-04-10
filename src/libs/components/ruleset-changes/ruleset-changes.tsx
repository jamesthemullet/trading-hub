import type { MerchandisingRules } from '@/libs/api';
import styled from '@emotion/styled';
import { ChangeProductBoostBury, Product } from '../product/product';
import { Layout, ProductBox } from '../visual-editor/visual-editor.styles';
import { spacing } from '../utils/spacing';
import { ChangePositionTypes } from '../../modules/ruleset/ruleset';
import { Text } from '../typography/typography.styles';
import { NumericAttribute } from '../ruleset-attributes/numeric-attribute';
import { AlphanumericAttribute } from '../ruleset-attributes/alphanumeric-attribute';
import { useCategoryPreview } from '../../hooks';

const Heading = styled(Text)`
  font-size: 20px;
  padding: ${spacing(2)} 0 0 ${spacing(2)};
`;

export const RulesetChanges = ({
  category,
  merchandisingRules,
  onChangePosition,
  onProductBoostBury,
}: {
  category?: string;
  merchandisingRules: MerchandisingRules;
  onChangePosition: ({ isPinned, newPosition }: ChangePositionTypes) => void;
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

  const { merchandisingRulesWithInfo } = useCategoryPreview(
    category,
    merchandisingRules
  );

  return (
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
      {merchandisingRulesWithInfo &&
        merchandisingRulesWithInfo.pinnedProducts && (
          <>
            <Heading as="h2" isStrong={true}>
              Pinned Products ({merchandisingRules.pinnedProducts.length})
            </Heading>

            <Layout>
              {merchandisingRulesWithInfo.pinnedProducts.map(
                (product, index) => {
                  return (
                    <ProductBox key={`product-${product.id}`}>
                      <Product
                        id={product.id}
                        productId={product.productId}
                        brand={product.brand}
                        imageUrl={product.imageUrl}
                        isInStock={product.isInStock}
                        metadata={product.metadata}
                        price={product.price}
                        rating={product.rating}
                        title={product.title}
                        url={product.url}
                        index={index}
                        pinnedProductsCount={
                          merchandisingRules.pinnedProducts.length
                        }
                        onChangePosition={onChangePosition}
                        onProductBoostBury={onProductBoostBury}
                        totalProducts={merchandisingRules.pinnedProducts.length}
                      />
                    </ProductBox>
                  );
                }
              )}
            </Layout>
          </>
        )}
    </>
  );
};
