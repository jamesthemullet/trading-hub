import type { MerchandisingRules, Product as ProductType } from '@/libs/api';
import styled from '@emotion/styled';
import { Typography } from '../typography/typography';
import { spacing } from '../utils/spacing';
import { Dropdown } from '../dropdown/dropdown';
import { useEffect, useState } from 'react';
import { useCategoryPreview } from '../../hooks';
import { ProductBox } from '../visual-editor/visual-editor.styles';
import { ProductDetails } from '../product/product';
import { ProductWrapper } from '../product/product.styles';

type Props = {
  categoryId: string;
  merchandisingRules: MerchandisingRules;
  onClose: () => void;
};

const Wrapper = styled.div`
  position: fixed;
  top: 80px;
  right: 8px;
  left: 72px;
  background: #fff;
  width: calc(100% - 80px);
  z-index: 10;
  height: calc(100vh - 84px);
  overflow: scroll;
  box-shadow: #000 0 0 10px -5px;
  max-height: calc(100vh - 90px);
`;

const Header = styled.div`
  padding: ${spacing(8)} ${spacing(2)} ${spacing(2)};
  display: flex;
  border-bottom: solid 1px #707070;
`;

const CloseButton = styled.button`
  background: url('/trading-hub/asset/icon-close-black.svg');
  width: 25px;
  height: 25px;
  display: inline-block;
  border: none;
  position: absolute;
  right: ${spacing(2)};
  top: ${spacing(2)};
  background-size: contain;
`;

const PreviewTypeSelector = styled.div`
  margin-left: auto;
  display: inline-flex;
  align-items: baseline;
`;

const Label = styled(Typography)`
  margin-right: ${spacing(2)};
  padding-top: ${spacing(1)};
`;

const DropdownWrapper = styled.div`
  width: 220px;
`;

const DropdownContent = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const Item = styled(Typography)`
  padding: ${spacing(1)};
  cursor: pointer;
  border: none;
  width: 100%;
  background: none;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const Content = styled.div`
  display: flex;
`;

const Facets = styled.div`
  width: 25%;
`;

const Products = styled.div`
  width: 75%;
  display: flex;
  flex-wrap: wrap;
`;

export const Preview = ({ categoryId, merchandisingRules, onClose }: Props) => {
  const [withRules, setWithRules] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [previewProducts, setPreviewProducts] = useState<ProductType[]>([]);

  const { categoryPreview, refetchRuleSetPreview } = useCategoryPreview(
    categoryId,
    withRules
      ? merchandisingRules
      : {
          pinnedProducts: [],
          blockedProducts: [],
          boosts: [],
        }
  );

  useEffect(() => {
    setPreviewProducts(categoryPreview);
  }, [categoryPreview]);

  const toggleView = (withMerchandisingRules: boolean) => {
    setIsDropdownOpen(false);
    setWithRules(withMerchandisingRules);
    refetchRuleSetPreview();
  };

  return (
    <Wrapper>
      <Header>
        <CloseButton onClick={onClose} aria-label="close modal"></CloseButton>
        <Typography as="p" style={{ paddingTop: '10px' }}>
          Search across the site to preview the rule influence
        </Typography>

        <PreviewTypeSelector>
          <Label as="p">Preview</Label>
          <DropdownWrapper>
            <Dropdown
              label={`${withRules ? 'with new rule change' : 'current state'}`}
              isOpen={isDropdownOpen}
              onOpen={() => {
                setIsDropdownOpen(true);
              }}
              onClose={() => {
                setIsDropdownOpen(false);
              }}
            >
              <DropdownContent>
                <Item
                  as="button"
                  onClick={() => {
                    toggleView(true);
                  }}
                >
                  with new rule change
                </Item>
                <Item
                  as="button"
                  onClick={() => {
                    toggleView(false);
                  }}
                >
                  current state
                </Item>
              </DropdownContent>
            </Dropdown>
          </DropdownWrapper>
        </PreviewTypeSelector>
      </Header>
      <Content>
        <Facets>
          <Typography as="p">TODO Facets</Typography>
        </Facets>
        <Products>
          {previewProducts.map((product) => (
            <ProductBox key={`product-${product.id}`}>
              <ProductWrapper isLastChanged={false}>
                <ProductDetails {...product} />
              </ProductWrapper>
            </ProductBox>
          ))}
        </Products>
      </Content>
    </Wrapper>
  );
};
