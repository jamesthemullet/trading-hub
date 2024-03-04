import type { MerchandisingRules } from '@/libs/api';
import styled from '@emotion/styled';
import { Product } from '../product/product';
import { Layout, ProductBox } from '../visual-editor/visual-editor.styles';
import { Typography } from '../typography/typography';
import { spacing } from '../utils/spacing';
import { ChangePositionTypes } from '../../modules/ruleset/ruleset';

const Heading = styled(Typography)`
  font-size: 20px;
  padding: ${spacing(2)} 0 0 ${spacing(2)};
`;

export const RulesetChanges = ({
  merchandisingRules,
  onChangePosition,
}: {
  merchandisingRules: MerchandisingRules;
  onChangePosition: ({
    isPinned,
    oldPosition,
    newPosition,
  }: ChangePositionTypes) => void;
}) => (
  <>
    <Heading as="h2" isStrong={true}>
      Pinned Products ({merchandisingRules.pinnedProducts.length})
    </Heading>

    <Layout>
      {merchandisingRules.pinnedProducts.map((product, index) => {
        return (
          <ProductBox key={`product-${product.id}`}>
            <Product
              id={product.id}
              brand="M&S Collection"
              imageUrl={[
                'SD_02_T32_9101_Y0_X_EC_0',
                'SD_02_T32_9101_Y0_X_EC_0',
                'SD_02_T32_9101_Y0_X_EC_90',
                'SD_02_T32_9101_Y0_X_EC_90',
              ]}
              isInStock={true}
              metadata={{ isPinned: true }}
              price="10"
              rating={4}
              title="Product title"
              url="https://www.example/com/foo/bar"
              index={index}
              pinnedProductsCount={merchandisingRules.pinnedProducts.length}
              onChangePosition={onChangePosition}
              totalProducts={merchandisingRules.pinnedProducts.length}
            />
          </ProductBox>
        );
      })}
    </Layout>
  </>
);
