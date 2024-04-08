import type { Facet, MerchandisingRules } from '@/libs/api';
import styled from '@emotion/styled';
import { spacing } from '../utils/spacing';
import { Dropdown } from '../dropdowns/dropdown/dropdown';
import { useState } from 'react';
import { useCategoryPreview } from '../../hooks';
import { ProductBox } from '../visual-editor/visual-editor.styles';
import { ProductDetails } from '../product/product';
import { ProductWrapper } from '../product/product.styles';
import { Text, Label, Header3 } from '../typography/typography.styles';
import { boxShadow } from '../utils/shared.styles';

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

const LabelText = styled(Label)`
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

const Item = styled(Text)`
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
  width: calc(25% - ${spacing(1)});
  margin-left: ${spacing(1)};
  ${boxShadow}
  margin-top: ${spacing(2)};
  padding: ${spacing(2)};
`;

const FacetName = styled(Label)`
  margin-left: ${spacing(2)};
  margin-bottom: ${spacing(1)};
`;

const ViewMore = styled(Label)`
  margin-left: ${spacing(2)};
  margin-bottom: ${spacing(1)};
  padding-left: 0;
  border: none;
  background: none;
  color: #4273b7;
  text-decoration: underline;
`;

const Products = styled.div`
  width: 75%;
  display: flex;
  flex-wrap: wrap;
`;

const FacetInfo = ({ facet }: { facet: Facet }) => {
  const [facetsToShow, setFacetsToShow] = useState(4);
  const { data, id } = facet;
  return (
    <>
      <Header3 style={{ marginBottom: spacing(2) }}>{id}</Header3>
      {data.map(
        (
          facet: {
            minimum?: number;
            maximum?: number;
            name?: string;
            count?: number;
          },
          index: number
        ) => {
          if (index < facetsToShow) {
            return (
              <FacetName key={facet.name || 'price'}>
                {id === 'Price'
                  ? `£${facet.minimum} - £${facet.maximum}`
                  : facet.name}
                &nbsp;({facet.count})
              </FacetName>
            );
          }
          if (index === facetsToShow) {
            return (
              <ViewMore
                key="view-more"
                as="button"
                onClick={() => setFacetsToShow(data.length)}
              >
                View more
              </ViewMore>
            );
          }
        }
      )}
    </>
  );
};

export const Preview = ({ categoryId, merchandisingRules, onClose }: Props) => {
  const [withRules, setWithRules] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const emptyRules = {
    pinnedProducts: [],
    blockedProducts: [],
  };

  const { categoryProducts, categoryFacets, setRules } = useCategoryPreview(
    categoryId,
    withRules ? merchandisingRules : emptyRules
  );

  const toggleView = (withMerchandisingRules: boolean) => {
    setIsDropdownOpen(false);
    setWithRules(withMerchandisingRules);
    setRules(withMerchandisingRules ? merchandisingRules : emptyRules);
  };

  return (
    <Wrapper>
      <Header>
        <CloseButton onClick={onClose} aria-label="close modal"></CloseButton>
        <Text style={{ paddingTop: '10px', fontSize: '16px' }}>
          Search across the site to preview the rule influence
        </Text>

        <PreviewTypeSelector>
          <LabelText as="p">Preview</LabelText>
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
          {categoryFacets.map((facet: Facet) => (
            <FacetInfo key={facet.id} facet={facet} />
          ))}
        </Facets>

        <Products>
          {categoryProducts.map((product) => (
            <ProductBox key={`product-${product.productId}`}>
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
