import type { ReactElement } from 'react';
import { useState } from 'react';
import { Modal } from '@mantine/core';

import type {
  MerchandisingExcludedFacets,
  MerchandisingFacet,
  MerchandisingProduct,
  MerchandisingRules,
  MerchandisingRuleSetFacetConfigWithId,
} from '@/libs/api';
import {
  Button,
  CombinedDropdown,
  DropdownVariant,
  Loader,
  Search,
  Typography,
} from '@/libs/components';
import { usePreview } from '@/libs/hooks';

import Image from 'next/image';

import styles from './preview.module.css';

const MISSING_IMAGE_SRC =
  'data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22307%22 height=%22400%22%3E%3Crect width=%22307%22 height=%22400%22 fill=%22%23cccccc%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23ffffff%22 font-family=%22sans-serif%22 font-size=%2240%22%3Emissing%20image%3C/text%3E%3C/svg%3E';

const EMPTY_MERCHANDISING_RULES: MerchandisingRules = {
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

const EMPTY_FACET_CONFIG: MerchandisingRuleSetFacetConfigWithId[] = [];

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

type ViewMode = 'newRuleChange' | 'currentState' | 'sideBySide';

const VIEW_MODE_LABEL: Record<ViewMode, string> = {
  newRuleChange: 'with new rule change',
  currentState: 'current state',
  sideBySide: 'side by side',
};

const ProductGrid = ({
  products,
}: {
  products: MerchandisingProduct[];
}): ReactElement => (
  <section className={styles.products}>
    {products.map(({ productId, imageUrl, isInStock, brand, title, price }) => {
      const firstImageUrl = imageUrl?.[0];

      return (
        <div className={styles.product} key={`product-${productId}`}>
          <div className={styles.productWrapper}>
            <div className={styles.productImage}>
              <Image
                src={
                  firstImageUrl
                    ? `https://asset1.cxnmarksandspencer.com/is/image/mands/${firstImageUrl}`
                    : MISSING_IMAGE_SRC
                }
                alt=""
                data-testid="productImage"
                width={100}
                height={176}
                sizes="100%"
                onError={(element) => {
                  // eslint-disable-next-line functional/immutable-data
                  element.currentTarget.src = MISSING_IMAGE_SRC;
                }}
              />
              {!isInStock && (
                <div className={styles.productOutOfStock}>
                  <Typography variant="bodySmall">Out of stock</Typography>
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
      );
    })}
  </section>
);

export const Preview = ({
  categoryId,
  countryCode,
  facetConfig,
  merchandisingRules,
  excludedFacets,
  onClose,
  previewTitle,
  searchTerm,
}: Props): ReactElement => {
  const [viewMode, setViewMode] = useState<ViewMode>('newRuleChange');
  const [shouldShowAllFacets, setShouldShowAllFacets] = useState(false);
  const [openFacetId, setOpenFacetId] = useState('');

  const commonPreviewArgs = {
    ...(categoryId && { categoryId }),
    ...(searchTerm && { searchTerm }),
    countryCode,
    excludedFacets,
  };

  const isSideBySide = viewMode === 'sideBySide';

  const newRuleChange = usePreview({
    ...commonPreviewArgs,
    merchandisingRules,
    facetConfig,
    isEnabled: viewMode !== 'currentState',
  });

  const currentState = usePreview({
    ...commonPreviewArgs,
    merchandisingRules: EMPTY_MERCHANDISING_RULES,
    facetConfig: EMPTY_FACET_CONFIG,
    excludedFacets: undefined,
    isEnabled: viewMode !== 'newRuleChange',
  });

  const activeData =
    viewMode === 'currentState' ? currentState.data : newRuleChange.data;
  const isLoading = isSideBySide
    ? currentState.isLoading || newRuleChange.isLoading
    : (viewMode === 'currentState' ? currentState : newRuleChange).isLoading;

  return (
    <Modal.Root opened onClose={onClose} centered padding={0} size="1280px">
      <Modal.Overlay blur={3} />
      <Modal.Content>
        <Modal.Body>
          <div className={styles.modalWrapper}>
            <section className={styles.modalHeader}>
              <div className={styles.titleAndButton}>
                <Modal.Title>
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
                    variant={DropdownVariant.Generic}
                    width={220}
                    label={VIEW_MODE_LABEL[viewMode]}
                    ariaLabel="Preview type selector"
                  >
                    <Button
                      className={styles.item}
                      type="button"
                      onClick={() => {
                        setViewMode('newRuleChange');
                      }}
                      role="menuitemradio"
                      aria-checked={viewMode === 'newRuleChange'}
                    >
                      <Typography variant="bodySmall" align="center">
                        with new rule change
                      </Typography>
                    </Button>
                    <Button
                      className={styles.item}
                      type="button"
                      onClick={() => {
                        setViewMode('currentState');
                      }}
                      role="menuitemradio"
                      aria-checked={viewMode === 'currentState'}
                    >
                      <Typography variant="bodySmall" align="center">
                        current state
                      </Typography>
                    </Button>
                    <Button
                      className={styles.item}
                      type="button"
                      onClick={() => {
                        setViewMode('sideBySide');
                      }}
                      role="menuitemradio"
                      aria-checked={viewMode === 'sideBySide'}
                    >
                      <Typography variant="bodySmall" align="center">
                        side by side
                      </Typography>
                    </Button>
                  </CombinedDropdown>
                </div>
              </div>
            </section>
            <div className={styles.content}>
              <Typography>{previewTitle}</Typography>

              {isSideBySide ? (
                <div className={styles.sideBySideWrapper}>
                  <div className={styles.sideBySideColumn}>
                    <div className={styles.sideBySideHeader}>
                      <Typography variant="bodyMedium" isStrong>
                        Current state
                      </Typography>
                    </div>
                    <ProductGrid products={currentState.data.products} />
                  </div>
                  <div className={styles.sideBySideDivider} />
                  <div className={styles.sideBySideColumn}>
                    <div className={styles.sideBySideHeader}>
                      <Typography variant="bodyMedium" isStrong>
                        With new rule change
                      </Typography>
                    </div>
                    <ProductGrid products={newRuleChange.data.products} />
                  </div>
                </div>
              ) : (
                <>
                  <div className={styles.facetRowWrapper}>
                    <div className={styles.facetContainer}>
                      {activeData.facets
                        .slice(
                          0,
                          shouldShowAllFacets ? activeData.facets.length : 5
                        )
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
                    {activeData.facets.length > 5 && (
                      <Button
                        className={styles.showAllButton}
                        appearance="plain"
                        type="button"
                        onClick={() =>
                          setShouldShowAllFacets(!shouldShowAllFacets)
                        }
                      >
                        <Image
                          src="https://static.marksandspencer.com/icons/svgs/FilterSwitch-v2.svg"
                          alt="filterSwitch"
                          width={32}
                          height={32}
                        />
                        <Typography as="span" isStrong>
                          {shouldShowAllFacets ? 'Fewer' : 'All'} Filters
                        </Typography>
                      </Button>
                    )}
                  </div>

                  {!!activeData.pagination.totalItems && (
                    <div className={styles.itemsFound}>
                      <Typography variant="bodySmall">
                        1 to{' '}
                        {activeData.pagination.totalItems &&
                        activeData.pagination.totalItems < 140
                          ? activeData.pagination.totalItems
                          : 140}{' '}
                        of {activeData.pagination.totalItems} items
                      </Typography>
                    </div>
                  )}

                  <ProductGrid products={activeData.products} />
                </>
              )}
            </div>

            {isLoading && <Loader />}
          </div>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};
