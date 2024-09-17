import styled from '@emotion/styled';
import { useState } from 'react';
import { Modal } from '@mantine/core';

import type {
  Facet,
  MerchandisingRules,
  RuleSetFacetConfigWithId,
} from '@/libs/api';
import { Dropdown, Loader } from '@/libs/components';
import { usePreview } from '@/libs/hooks';

import { ProductDetails } from '../product/product';
import { ProductWrapper } from '../product/product.styles';
import { Header3, Label, Text } from '../typography/typography.styles';
import { boxShadow } from '../utils/shared.styles';
import { spacing } from '../utils/spacing';
import { ProductBox } from '../visual-editor/visual-editor.styles';

type Props = {
  facetConfig: RuleSetFacetConfigWithId[];
  merchandisingRules: MerchandisingRules;
  onClose: () => void;
  categoryId?: string;
  searchTerm?: string;
};

const Wrapper = styled.div`
  background: #fff;
  z-index: 10;
  height: calc(100vh - 84px);
  overflow: scroll;
  max-height: calc(100vh - 90px);
  min-width: 700px;
  position: relative;
  padding-top: 140px;
`;

const Header = styled.div`
  padding: ${spacing(8)} ${spacing(2)} ${spacing(2)};
  display: flex;
  border-bottom: solid 1px #707070;
  position: fixed;
  z-index: 10;
  width: 100%;
  top: 0;
  background: #fff;
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
  overflow: auto;
`;

const Facets = styled.div`
  width: calc(25% - ${spacing(3)});
  margin-left: ${spacing(1)};
  ${boxShadow}
  margin-top: ${spacing(2)};
  margin-right: ${spacing(2)};
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
  gap: 10px;
  padding-top: ${spacing(2)};
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

export const Preview = ({
  categoryId,
  facetConfig,
  merchandisingRules,
  onClose,
  searchTerm,
}: Props) => {
  const [withRules, setWithRules] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const emptyRules: MerchandisingRules = {
    pinnedProducts: [],
    blockedProducts: [],
    boosts: { alphanumeric: [], numeric: [], product: [] },
    buries: { alphanumeric: [], numeric: [], product: [] },
    includes: {
      alphanumeric: [],
    },
    excludes: {
      alphanumeric: [],
    },
  };

  const { data, isLoading, setRules, setFacetConfigRules } = usePreview({
    ...(categoryId && { categoryId }),
    ...(searchTerm && { searchTerm }),
    merchandisingRules,
    facetConfig,
  });

  const toggleView = (withMerchandisingRules: boolean) => {
    setIsDropdownOpen(false);
    setWithRules(withMerchandisingRules);
    setRules(withMerchandisingRules ? merchandisingRules : emptyRules);
    setFacetConfigRules(withMerchandisingRules ? facetConfig : []);
  };

  return (
    <Modal.Root
      opened={true}
      onClose={onClose}
      centered
      padding={0}
      size="90vw"
    >
      <Modal.Overlay blur={3} />
      <Modal.Content>
        <Modal.Body>
          <Wrapper>
            <Header>
              <CloseButton
                onClick={onClose}
                aria-label="close modal"
              ></CloseButton>
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
                {data.facets.map((facet: Facet) => (
                  <FacetInfo key={facet.id} facet={facet} />
                ))}
              </Facets>

              <Products>
                {data.products.map((product) => (
                  <ProductBox key={`product-${product.productId}`}>
                    <ProductWrapper>
                      <ProductDetails {...product} />
                    </ProductWrapper>
                  </ProductBox>
                ))}
              </Products>
            </Content>

            {isLoading && <Loader />}
          </Wrapper>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};
