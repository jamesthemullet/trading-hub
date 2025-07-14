import styled from '@emotion/styled';
import { useState } from 'react';
import { Modal } from '@mantine/core';

import type {
  MerchandisingExcludedFacets,
  MerchandisingFacet,
  MerchandisingRules,
  MerchandisingRuleSetFacetConfigWithId,
} from '@/libs/api';
import { CombinedDropdown, Loader, Search } from '@/libs/components';
import { usePreview } from '@/libs/hooks';

import Image from 'next/image';

import { Icon } from '../icon/icon';
import { fonts, Label, Text } from '../typography/typography.styles';
import { color } from '../utils/constants';
import { spacing } from '../utils/spacing';

export type Props = {
  countryCode: 'UK' | 'IE';
  facetConfig: MerchandisingRuleSetFacetConfigWithId[];
  merchandisingRules: MerchandisingRules;
  onClose: () => void;
  categoryId?: string;
  searchTerm?: string;
  previewTitle?: string;
  excludedFacets?: MerchandisingExcludedFacets;
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
  padding: ${spacing(2)} ${spacing(2)} 0;
  display: flex;
  flex-wrap: wrap;
  border-bottom: solid 1px #707070;
  position: fixed;
  z-index: 10;
  width: 100%;
  top: 0;
  background: #fff;
`;

const Title = styled(Text)`
  font-size: 24px;
  display: block;
  width: 100%;
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
  padding: 0 ${spacing(2)};
`;

const Facets = styled.div`
  padding: ${spacing(2)} ${spacing(20)} ${spacing(1)} 0;
  border-top: solid 1px ${color.lightGrey};
  border-bottom: solid 1px ${color.lightGrey};
  position: relative;
  margin-bottom: ${spacing(2)};
`;

const FacetButton = styled.button`
  border: none;
  background-color: transparent;
  padding: ${spacing(1)} 0 0;
  width: fit-content;
`;

const FacetText = styled(Text)`
  font-family: ${fonts.semiBold};
  font-size: 14px;
  margin-bottom: ${spacing(2)};
  display: flex;
  margin-right: ${spacing(3)};
`;

const FacetName = styled(Text)`
  display: flex;
  margin-bottom: ${spacing(1)};
  font-size: 16px;
`;

const FacetCount = styled.span`
  margin-left: auto;
  font-weight: bold;
  color: ${color.grey};
`;

const ShowAllButton = styled.button`
  border: 0;
  background: none;
  position: absolute;
  right: ${spacing(2)};
  display: inline-flex;
  align-items: center;
  top: 20px;
`;

const FacetWrapper = styled.div`
  position: relative;
  display: inline;
`;

const FacetDropdown = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  left: 0;
  top: 24px;
  background-color: #fff;
  z-index: 2;
  width: 290px;
  overflow: hidden;
  border: none;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 8px 12px 0px;
  padding: ${spacing(2)};
`;

const StyledSearch = styled(Search)`
  width: 100%;
  border: solid 1px ${color.grey};
  margin-bottom: ${spacing(2)};

  & > div {
    border: none;
    & > input {
      background: #fff;

      &::placeholder {
        color: ${color.lightGrey};
      }
    }
  }
`;

const PriceFilter = styled.div`
  padding: ${spacing(2)};
`;

const PriceFilterContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 45px;
  width: 100%;
`;

const PriceFilterValues = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-bottom: ${spacing(2)};
`;

const PriceFilterSlider = styled.div`
  position: relative;
  width: calc(100% - ${spacing(2)});
  margin: 0 ${spacing(1)};

  &::before,
  &::after {
    content: '';
    position: absolute;
    height: ${spacing(3)};
    width: ${spacing(3)};
    background-image: url(https://static.marksandspencer.com/icons/svgs/SliderHandle.svg);
    background-size: 100%;
    border-radius: 50%;
  }
  &::before {
    left: -8px;
    top: -12px;
  }
  &::after {
    right: -8px;
    top: -12px;
  }
`;

const PriceFilterSliderValue = styled.div`
  height: 2px;
  position: absolute;
  background-color: #000;
  left: 0;
  top: -1px;
  width: 100%;
`;

const Products = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  height: max-content;
`;

const Product = styled.div`
  width: calc(25% - 16px);
`;

const ProductWrapper = styled.div`
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const ProductOutOfStock = styled(Text)`
  background-color: rgba(224, 228, 231, 0.85);
  position: absolute;
  width: 100%;
  bottom: 0;
  padding: ${spacing(0.5)};
`;

const ProductImage = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  aspect-ratio: auto 384 / 500;
  align-items: end;

  img {
    width: 100%;
    max-width: 100%;
    height: auto;
  }
`;

const ProductInfo = styled.div`
  padding: ${spacing(1)} 0;
`;

const FacetInfo = ({
  currency,
  facet,
  isDropdownOpen,
  setIsDropdownOpen,
}: {
  currency: string;
  facet: MerchandisingFacet;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (id: string) => void;
}) => {
  const { data, id } = facet;
  const [filter, setFilter] = useState('');

  return (
    <FacetWrapper>
      <FacetButton onClick={() => setIsDropdownOpen(id)}>
        <FacetText as="span">
          {id}{' '}
          <Icon
            name={isDropdownOpen ? 'ChevronUpDefault' : 'ChevronDownDefault'}
            color={'#000'}
            size={20}
          />
        </FacetText>
      </FacetButton>
      {isDropdownOpen && (
        <FacetDropdown>
          {id !== 'Price' && (
            <StyledSearch
              placeholder="Search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          )}
          {data.map(
            (facet: {
              minimum?: number;
              maximum?: number;
              name?: string;
              count?: number;
            }) =>
              id === 'Price' ? (
                <PriceFilter key="price">
                  <PriceFilterContent>
                    <PriceFilterValues>
                      <Text isStrong>
                        {currency}
                        {facet.minimum}
                      </Text>
                      <Text isStrong>
                        {currency}
                        {facet.maximum}
                      </Text>
                    </PriceFilterValues>
                    <PriceFilterSlider>
                      <PriceFilterSliderValue />
                    </PriceFilterSlider>
                  </PriceFilterContent>
                </PriceFilter>
              ) : (
                facet.name &&
                facet.name.toLowerCase().includes(filter.toLowerCase()) && (
                  <FacetName key={facet.name}>
                    {facet.name}
                    <FacetCount>({facet.count})</FacetCount>
                  </FacetName>
                )
              )
          )}
        </FacetDropdown>
      )}
    </FacetWrapper>
  );
};

export const Preview = ({
  categoryId,
  countryCode,
  facetConfig,
  merchandisingRules,
  excludedFacets,
  onClose,
  previewTitle,
  searchTerm,
}: Props) => {
  const [withRules, setWithRules] = useState(true);
  const [rules, setRules] = useState(merchandisingRules);
  const [showAllFacets, setShowAllFacets] = useState(false);
  const [openFacetId, setOpenFacetId] = useState('');

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

  const { data, isLoading, setFacetConfigRules } = usePreview({
    ...(categoryId && { categoryId }),
    ...(searchTerm && { searchTerm }),
    countryCode,
    merchandisingRules: rules,
    facetConfig,
    excludedFacets,
  });

  const toggleView = (withMerchandisingRules: boolean) => {
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
      size="1280px"
      role="dialog"
      aria-modal="true"
      aria-label="Preview modal"
    >
      <Modal.Overlay blur={3} />
      <Modal.Content>
        <Modal.Body>
          <Wrapper>
            <Header>
              <Title as="h2">Preview</Title>
              <CloseButton onClick={onClose} aria-label="close modal" />
              <Text style={{ paddingTop: '10px', fontSize: '16px' }}>
                View rule changes made on the website below
              </Text>

              <PreviewTypeSelector>
                <LabelText as="p">Preview</LabelText>
                <DropdownWrapper>
                  <CombinedDropdown
                    variant="generic"
                    width={220}
                    label={`${withRules ? 'with new rule change' : 'current state'}`}
                    ariaLabel="Preview type selector"
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
                  </CombinedDropdown>
                </DropdownWrapper>
              </PreviewTypeSelector>
            </Header>
            <Content>
              <Title style={{ marginBottom: spacing(2) }}>{previewTitle}</Title>
              <Facets>
                {data.facets
                  .slice(0, showAllFacets ? data.facets.length : 5)
                  .map((facet: MerchandisingFacet) => (
                    <FacetInfo
                      key={facet.id}
                      facet={facet}
                      isDropdownOpen={openFacetId === facet.id}
                      setIsDropdownOpen={(id: string) => {
                        setOpenFacetId(openFacetId === id ? '' : id);
                      }}
                      currency={countryCode === 'UK' ? '£' : '€'}
                    />
                  ))}
                {data.facets.length > 5 && (
                  <ShowAllButton
                    onClick={() => setShowAllFacets(!showAllFacets)}
                  >
                    <Icon name="FilterSwitch" size={32} />
                    <Text as="span" isStrong style={{ fontSize: '16px' }}>
                      {showAllFacets ? 'Fewer' : 'All'} Filters
                    </Text>
                  </ShowAllButton>
                )}
              </Facets>

              {!!data.pagination.totalItems && (
                <Text style={{ color: color.grey, marginBottom: spacing(2) }}>
                  1 to{' '}
                  {data.pagination.totalItems &&
                  data.pagination.totalItems < 140
                    ? data.pagination.totalItems
                    : 140}{' '}
                  of {data.pagination.totalItems} items
                </Text>
              )}

              <Products>
                {data.products.map(
                  ({ productId, imageUrl, isInStock, brand, title, price }) => (
                    <Product key={`product-${productId}`}>
                      <ProductWrapper>
                        <ProductImage>
                          <Image
                            src={`https://asset1.cxnmarksandspencer.com/is/image/mands/${imageUrl[0]}`}
                            alt=""
                            data-testid="productImage"
                            width={100}
                            height={176}
                            style={{ objectFit: 'contain' }}
                            priority
                            sizes="100%"
                            onError={(element) =>
                              // eslint-disable-next-line functional/immutable-data
                              (element.currentTarget.src =
                                'https://dummyimage.com/307x400/cccccc/ffffff?text=missing+image')
                            }
                          />
                          {!isInStock && (
                            <ProductOutOfStock>Out of stock</ProductOutOfStock>
                          )}
                        </ProductImage>
                        <ProductInfo>
                          <Text isStrong>{price}</Text>
                          <Text isStrong style={{ textTransform: 'uppercase' }}>
                            {brand}
                          </Text>
                          <Text>{title}</Text>
                        </ProductInfo>
                      </ProductWrapper>
                    </Product>
                  )
                )}
              </Products>
            </Content>

            {isLoading && <Loader />}
          </Wrapper>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};
