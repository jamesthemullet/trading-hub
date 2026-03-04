import { useId, useState } from 'react';
import { Modal } from '@mantine/core';

import type {
  MerchandisingExcludedFacets,
  MerchandisingFacet,
  MerchandisingRules,
  MerchandisingRuleSetFacetConfigWithId,
} from '@/libs/api';
import {
  Button,
  CombinedDropdown,
  Loader,
  Search,
  Typography,
} from '@/libs/components';
import { usePreview } from '@/libs/hooks';

import Image from 'next/image';

import styles from './preview.module.css';

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
    <div className={styles.facetWrapper}>
      <Button
        className={styles.facetButton}
        appearance="plain"
        type="button"
        onClick={() => setIsDropdownOpen(id)}
      >
        <Typography as="span" isStrong variant="bodySmall">
          {id}{' '}
          <Image
            className={styles.dropdownIcon}
            data-open={isDropdownOpen}
            src="https://static.marksandspencer.com/icons/svgs/ChevronUpDefault.svg"
            width={20}
            height={20}
            alt=""
            sizes="20px"
          />
        </Typography>
      </Button>
      {isDropdownOpen && (
        <div className={styles.facetDropdown}>
          {id !== 'Price' && (
            <Search
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
                <div className={styles.priceFilter} key="price">
                  <div className={styles.priceFilterValues}>
                    <Typography variant="bodySmall" isStrong>
                      {currency}
                      {facet.minimum}
                    </Typography>
                    <Typography variant="bodySmall" isStrong>
                      {currency}
                      {facet.maximum}
                    </Typography>
                  </div>
                  <div className={styles.priceFilterSlider}>
                    <div className={styles.priceFilterSliderTrack} />
                  </div>
                </div>
              ) : (
                facet.name?.toLowerCase().includes(filter.toLowerCase()) && (
                  <span className={styles.facetItem} key={facet.name}>
                    <Typography>{facet.name}</Typography>
                    <Typography as="span">({facet.count})</Typography>
                  </span>
                )
              )
          )}
        </div>
      )}
    </div>
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
  const modalTitleId = useId();
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
    <Modal.Root opened onClose={onClose} centered padding={0} size="1280px">
      <Modal.Overlay blur={3} />
      <Modal.Content aria-labelledby={modalTitleId}>
        <Modal.Body>
          <div className={styles.modalWrapper}>
            <section className={styles.modalHeader}>
              <div className={styles.titleAndButton}>
                <Modal.Title id={modalTitleId}>
                  <Typography variant="titleMedium">Preview</Typography>
                </Modal.Title>
                <Button
                  appearance="icon"
                  className={styles.closeButton}
                  onClick={onClose}
                  aria-label="close modal"
                />
              </div>
              <div className={styles.previewRow}>
                <Typography variant="bodyMedium">
                  View rule changes made on the website below
                </Typography>

                <div className={styles.previewTypeSelector}>
                  <Typography variant="bodySmall">Preview</Typography>
                  <CombinedDropdown
                    variant="generic"
                    width={220}
                    label={`${withRules ? 'with new rule change' : 'current state'}`}
                    ariaLabel="Preview type selector"
                  >
                    <Button
                      className={styles.item}
                      type="button"
                      onClick={() => {
                        toggleView(true);
                      }}
                      role="menuitemradio"
                      aria-checked={withRules}
                    >
                      <Typography variant="bodySmall" align="center">
                        with new rule change
                      </Typography>
                    </Button>
                    <Button
                      className={styles.item}
                      type="button"
                      onClick={() => {
                        toggleView(false);
                      }}
                      role="menuitemradio"
                      aria-checked={!withRules}
                    >
                      <Typography variant="bodySmall" align="center">
                        current state
                      </Typography>
                    </Button>
                  </CombinedDropdown>
                </div>
              </div>
            </section>
            <div className={styles.content}>
              <Typography>{previewTitle}</Typography>
              <div className={styles.facetRowWrapper}>
                <div className={styles.facetContainer}>
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
                </div>
                {data.facets.length > 5 && (
                  <Button
                    className={styles.showAllButton}
                    appearance="plain"
                    type="button"
                    onClick={() => setShowAllFacets(!showAllFacets)}
                  >
                    <Image
                      src="https://static.marksandspencer.com/icons/svgs/FilterSwitch-v2.svg"
                      alt="filterSwitch"
                      width={32}
                      height={32}
                    />
                    <Typography as="span" isStrong>
                      {showAllFacets ? 'Fewer' : 'All'} Filters
                    </Typography>
                  </Button>
                )}
              </div>

              {!!data.pagination.totalItems && (
                <div className={styles.itemsFound}>
                  <Typography variant="bodySmall">
                    1 to{' '}
                    {data.pagination.totalItems &&
                    data.pagination.totalItems < 140
                      ? data.pagination.totalItems
                      : 140}{' '}
                    of {data.pagination.totalItems} items
                  </Typography>
                </div>
              )}

              <section className={styles.products}>
                {data.products.map(
                  ({ productId, imageUrl, isInStock, brand, title, price }) => (
                    <div
                      className={styles.product}
                      key={`product-${productId}`}
                    >
                      <div className={styles.productWrapper}>
                        <div className={styles.productImage}>
                          <Image
                            src={`https://asset1.cxnmarksandspencer.com/is/image/mands/${imageUrl[0]}`}
                            alt=""
                            data-testid="productImage"
                            width={100}
                            height={176}
                            sizes="100%"
                            onError={(element) => {
                              // eslint-disable-next-line functional/immutable-data
                              element.currentTarget.src =
                                'https://dummyimage.com/307x400/cccccc/ffffff?text=missing+image';
                            }}
                          />
                          {!isInStock && (
                            <div className={styles.productOutOfStock}>
                              <Typography variant="bodySmall">
                                Out of stock
                              </Typography>
                            </div>
                          )}
                        </div>
                        <div className={styles.productInfo}>
                          <Typography variant="bodySmall" isStrong>
                            {price}
                          </Typography>
                          <Typography variant="bodySmall" isStrong uppercase>
                            {brand}
                          </Typography>
                          <Typography variant="bodySmall">{title}</Typography>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </section>
            </div>

            {isLoading && <Loader />}
          </div>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};
