import type {
  ChangeEvent,
  DetailedHTMLProps,
  Dispatch,
  HTMLAttributes,
} from 'react';
import { useEffect, useRef, useState } from 'react';
import { Skeleton } from '@mantine/core';

import type {
  MerchandisingProduct as ProductType,
  MerchandisingRankingAttribute,
} from '@/libs/api';
import { Button } from '@/libs/components';
import { Checkbox } from '@/libs/components/checkboxes/checkbox';
import type { RuleSetActions } from '@/libs/components/types';
import { Typography } from '@/libs/components/typography/typography.styles';

import Image from 'next/image';

import {
  BlockedPin,
  BoostPin,
  BuriedPin,
  ErrorText,
  LockActions,
  LockInput,
  LockMenu,
  OutOfStockMessage,
  ProductCard,
  ProductHeader,
  ProductInfo,
  ProductInfoWrapper,
  ProductMenu,
  ProductMenuButton,
  ProductMenuHead,
  ProductMenuOverlay,
  ProductMenuToggle,
  ProductNumber,
  ProductPin,
  ProductWrapper,
  SupplementaryInfo,
} from './product.styles';

const ProductDetails = ({
  imageUrl,
  brand,
  isBrandStrong,
  isOutOfStock,
  isSearchResult,
  hasSupplementaryInfo,
  title,
  price,
  productId,
  ranking,
}: Pick<ProductType, 'title' | 'price' | 'brand' | 'productId' | 'imageUrl'> & {
  isOutOfStock: boolean;
  isBrandStrong?: boolean;
  isSearchResult?: boolean;
  hasSupplementaryInfo?: boolean;
  ranking?: Array<MerchandisingRankingAttribute>;
}) => {
  return (
    <>
      <ProductCard hasSupplementaryInfo={hasSupplementaryInfo}>
        <Image
          src={`https://asset1.cxnmarksandspencer.com/is/image/mands/${imageUrl[0]}`}
          alt=""
          data-testid="productImage"
          width={100}
          height={176}
          style={{ objectFit: 'contain' }}
          priority
          sizes="100%"
          onError={(element) => {
            // eslint-disable-next-line functional/immutable-data
            element.currentTarget.src =
              'https://dummyimage.com/300x400/cccccc/ffffff?text=missing+image';
          }}
        />
        {isOutOfStock && <OutOfStockMessage>Out of stock</OutOfStockMessage>}
      </ProductCard>
      <ProductInfo isSearchResult={isSearchResult}>
        <Typography
          variant="bodySmall"
          isStrong={isBrandStrong ?? true}
          data-testid="product title"
        >
          {brand} {title}
        </Typography>
        <Typography variant="bodySmall">{price}</Typography>
        <Typography variant="bodySmall" data-testid="product id" align="right">
          ID: {productId}
        </Typography>
      </ProductInfo>
      {hasSupplementaryInfo && ranking && (
        <SupplementaryInfo>
          {ranking.map((item) => (
            <Typography variant="bodySmall" key={item.property}>
              {item.property} <span>{item.values[0]}</span>
            </Typography>
          ))}
        </SupplementaryInfo>
      )}
    </>
  );
};

export type ProductProps = ProductType & {
  index: number;
  isPinnable: boolean;
  dispatch: Dispatch<RuleSetActions>;
  pinnedProductsCount?: number;
  onSelectProduct?: ({
    id,
    isSelected,
  }: {
    id: string;
    isSelected: boolean;
  }) => void;
  isSelected: boolean;
  isSelectionDisabled: boolean;
  isBrandStrong?: boolean;
  isProductNumberEnabled?: boolean;
  isSearchResult?: boolean;
  hasSupplementaryInfo?: boolean;
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export const Product = ({
  brand,
  dispatch,
  id,
  imageUrl,
  index,
  isBrandStrong,
  isInStock,
  isPinnable,
  isProductNumberEnabled,
  isSearchResult = false,
  hasSupplementaryInfo = false,
  isSelected,
  isSelectionDisabled,
  metadata: { isPinned, isBoosted, isBuried, isBlocked, ranking },
  onSelectProduct,
  pinnedProductsCount,
  price,
  productId,
  title,
  ...rest
}: ProductProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLockToPositionMenuOpen, setIsLockToPositionMenuOpen] =
    useState(false);
  const [positionToLockTo, setPositionToLockTo] = useState<number>();
  const [error, setError] = useState('');
  const totalPinnedProducts =
    pinnedProductsCount || /* istanbul ignore next */ 0;

  const lockToPosition = (positionToPin: number) => {
    setIsMenuOpen(false);
    setIsLockToPositionMenuOpen(false);
    setIsMenuOpen(false);
    dispatch({
      type: 'product',
      payload: {
        ids: [id],
        operation: 'pin',
        change: 'add',
        position: positionToPin,
      },
    });
  };

  const clearChanges = () => {
    dispatch({
      type: 'product',
      payload: { ids: [id], operation: 'pin', change: 'remove' },
    });
    setIsMenuOpen(false);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    setPositionToLockTo(parseInt(value));

    const diff = isPinned ? 0 : 1;

    if (
      (value && parseInt(value) > totalPinnedProducts + diff) ||
      (value && parseInt(value) < 1)
    ) {
      if (totalPinnedProducts === 0) {
        setError('Please choose a position sequentially starting from 1');
      } else {
        setError(
          `Please choose a position between 1 and ${totalPinnedProducts + diff}`
        );
      }
    } else {
      setError('');
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLockToPositionMenuOpen]);

  return (
    <ProductWrapper aria-label={`Position ${index + 1}`} {...rest}>
      {isMenuOpen && (
        <ProductMenuOverlay
          data-testid="menu overlay"
          onClick={() => {
            setIsMenuOpen(!isMenuOpen);
            setIsLockToPositionMenuOpen(false);
          }}
          aria-label="Close product menu"
          role="button"
        />
      )}
      <ProductHeader>
        <Checkbox
          label={`Select ${title}`}
          disabled={isSelectionDisabled}
          checked={isSelected}
          onChange={() => onSelectProduct?.({ id, isSelected })}
        />
        <ProductInfoWrapper>
          {(isProductNumberEnabled ?? true) && (
            <ProductNumber>{index + 1}</ProductNumber>
          )}
          {isBoosted && (
            <BoostPin aria-label="Boosted product">
              <Typography variant="labelSmall">Boost</Typography>
            </BoostPin>
          )}
          {isBuried && (
            <BuriedPin aria-label="Buried product">
              <Typography variant="labelSmall">Bury</Typography>
            </BuriedPin>
          )}
          {isPinned && (
            <ProductPin aria-label="Pinned product">
              <Typography variant="labelSmall">Pinned</Typography>
            </ProductPin>
          )}
          {isBlocked && (
            <BlockedPin aria-label="Blocked product">
              <Typography variant="labelSmall">Block</Typography>
            </BlockedPin>
          )}
        </ProductInfoWrapper>
        <ProductMenuToggle
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          title={`${isMenuOpen ? 'Close' : 'Open'} menu`}
          disabled={isSelectionDisabled}
        >
          <Image
            alt=""
            src={`/trading-hub/asset/icon-${isMenuOpen ? 'minus' : 'plus'}.svg`}
            width={20}
            height={20}
          />
        </ProductMenuToggle>
        {isMenuOpen && (
          <ProductMenu>
            <ProductMenuHead>
              <Typography variant="bodySmall" isStrong>
                Product actions
              </Typography>
            </ProductMenuHead>
            {isPinned && isPinnable && (
              <ProductMenuButton
                icon="restore"
                as="button"
                size="16px 16px"
                onClick={() => clearChanges()}
              >
                Restore
              </ProductMenuButton>
            )}
            {isBoosted && (
              <ProductMenuButton
                icon="restore"
                as="button"
                size="16px 16px"
                onClick={() => {
                  dispatch({
                    type: 'product',
                    payload: {
                      ids: [id],
                      operation: 'boost',
                      change: 'remove',
                    },
                  });
                  setIsMenuOpen(false);
                }}
              >
                Unboost
              </ProductMenuButton>
            )}
            {isBuried && (
              <ProductMenuButton
                icon="restore"
                as="button"
                size="16px 16px"
                onClick={() => {
                  dispatch({
                    type: 'product',
                    payload: {
                      ids: [id],
                      operation: 'bury',
                      change: 'remove',
                    },
                  });
                  setIsMenuOpen(false);
                }}
              >
                Unbury
              </ProductMenuButton>
            )}
            {isBlocked && (
              <ProductMenuButton
                icon="restore"
                as="button"
                size="16px 16px"
                onClick={() => {
                  dispatch({
                    type: 'product',
                    payload: {
                      ids: [id],
                      operation: 'block',
                      change: 'remove',
                    },
                  });
                  setIsMenuOpen(false);
                }}
              >
                Restore
              </ProductMenuButton>
            )}
            {!isLockToPositionMenuOpen && (
              <>
                {isPinnable && (
                  <ProductMenuButton
                    icon="pin"
                    as="button"
                    onClick={() => setIsLockToPositionMenuOpen(true)}
                  >
                    {isPinned ? 'Edit position' : 'Pin in position'}
                  </ProductMenuButton>
                )}
                {!isBoosted && (
                  <ProductMenuButton
                    icon="boost"
                    as="button"
                    onClick={() => {
                      dispatch({
                        type: 'product',
                        payload: {
                          ids: [id],
                          operation: 'boost',
                          change: 'add',
                        },
                      });
                      setIsMenuOpen(false);
                    }}
                  >
                    Boost to Top
                  </ProductMenuButton>
                )}

                {!isBuried && (
                  <ProductMenuButton
                    icon="bury"
                    as="button"
                    onClick={() => {
                      dispatch({
                        type: 'product',
                        payload: {
                          ids: [id],
                          operation: 'bury',
                          change: 'add',
                        },
                      });
                      setIsMenuOpen(false);
                    }}
                  >
                    Bury to Bottom
                  </ProductMenuButton>
                )}

                {!isBlocked && (
                  <ProductMenuButton
                    icon="block"
                    as="button"
                    onClick={() => {
                      dispatch({
                        type: 'product',
                        payload: {
                          ids: [id],
                          operation: 'block',
                          change: 'add',
                        },
                      });
                      setIsMenuOpen(false);
                    }}
                  >
                    Block Product
                  </ProductMenuButton>
                )}
              </>
            )}

            {isLockToPositionMenuOpen && (
              <LockMenu
                style={{
                  height: error ? '330px' : '245px',
                }}
              >
                <Typography
                  variant="bodySmall"
                  isStrong
                  withMargin
                  aria-label="Pinning heading"
                >
                  Slot position
                </Typography>
                <Typography variant="bodySmall" withMargin>
                  Select the position number you want to set for this product.
                </Typography>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    // istanbul ignore else
                    if (
                      positionToLockTo &&
                      positionToLockTo < totalPinnedProducts + 2
                    ) {
                      lockToPosition(positionToLockTo - 1);
                    }
                  }}
                >
                  <LockInput
                    ref={inputRef}
                    placeholder="i.e. 3"
                    onChange={onInputChange}
                    defaultValue={positionToLockTo || ''}
                    type="number"
                    hasError={!!error.length}
                  />
                  {error && (
                    <ErrorText aria-label="Error message">{error}</ErrorText>
                  )}
                  <LockActions isSearchResult={isSearchResult}>
                    <Button onClick={() => setIsLockToPositionMenuOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      theme="primary"
                      type="submit"
                      isDisabled={!!error || !positionToLockTo}
                    >
                      Confirm
                    </Button>
                  </LockActions>
                </form>
              </LockMenu>
            )}
          </ProductMenu>
        )}
      </ProductHeader>
      <ProductDetails
        imageUrl={imageUrl}
        brand={brand}
        isBrandStrong={isBrandStrong}
        title={title}
        price={price}
        productId={productId}
        isOutOfStock={isInStock === false}
        isSearchResult={isSearchResult}
        hasSupplementaryInfo={hasSupplementaryInfo}
        ranking={ranking}
      />
    </ProductWrapper>
  );
};

export const MissingProduct = ({
  dispatch,
  id,
  index,
  isProductNumberEnabled,
  isPinned,
  isBoosted,
  isBuried,
  isBlocked,
  onSelectProduct,
  isSelected,
  isSelectionDisabled,
  ...rest
}: {
  dispatch: Dispatch<RuleSetActions>;
  index: number;
  id: string;
  onSelectProduct: ({
    id,
    isSelected,
  }: {
    id: string;
    isSelected: boolean;
  }) => void;
  isSelected: boolean;
  isSelectionDisabled: boolean;
  isProductNumberEnabled?: boolean;
  isPinned?: boolean;
  isBoosted?: boolean;
  isBuried?: boolean;
  isBlocked?: boolean;
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const clearChanges = () => {
    dispatch({
      type: 'product',
      payload: { ids: [id], operation: 'pin', change: 'remove' },
    });
  };

  return (
    <ProductWrapper aria-label={`Position ${index + 1}`} {...rest}>
      {isMenuOpen && (
        <ProductMenuOverlay
          aria-label="menu overlay"
          onClick={() => {
            setIsMenuOpen(!isMenuOpen);
          }}
        />
      )}
      <ProductHeader>
        <Checkbox
          label={`Select ${id}`}
          disabled={isSelectionDisabled}
          checked={isSelected}
          onChange={() => onSelectProduct?.({ id, isSelected })}
        />
        <ProductInfoWrapper>
          {(isProductNumberEnabled ?? true) && (
            <ProductNumber>{index + 1}</ProductNumber>
          )}
          {isBoosted && (
            <BoostPin aria-label="Boosted product">
              <Typography variant="labelSmall">Boost</Typography>
            </BoostPin>
          )}
          {isBuried && (
            <BuriedPin aria-label="Buried product">
              <Typography variant="labelSmall">Bury</Typography>
            </BuriedPin>
          )}
          {isPinned && (
            <ProductPin aria-label="Pinned product">
              <Typography variant="labelSmall">Pinned</Typography>
            </ProductPin>
          )}
          {isBlocked && (
            <BlockedPin aria-label="Blocked product">
              <Typography variant="labelSmall">Block</Typography>
            </BlockedPin>
          )}
        </ProductInfoWrapper>
        <ProductMenuToggle
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          title={`${isMenuOpen ? 'Close' : 'Open'} menu`}
        >
          <Image
            alt=""
            src={`/trading-hub/asset/icon-${isMenuOpen ? 'minus' : 'plus'}.svg`}
            width={20}
            height={20}
          />
        </ProductMenuToggle>
        {isMenuOpen && (
          <ProductMenu>
            <ProductMenuHead>
              <Typography variant="bodySmall" isStrong as="h4">
                Product actions
              </Typography>
            </ProductMenuHead>
            {isPinned && (
              <ProductMenuButton
                icon="restore"
                as="button"
                size="16px 16px"
                onClick={() => clearChanges()}
              >
                Restore
              </ProductMenuButton>
            )}
            {isBoosted && (
              <ProductMenuButton
                icon="restore"
                as="button"
                size="16px 16px"
                onClick={() => {
                  dispatch({
                    type: 'product',
                    payload: {
                      ids: [id],
                      operation: 'boost',
                      change: 'remove',
                    },
                  });
                  setIsMenuOpen(false);
                }}
              >
                Unboost
              </ProductMenuButton>
            )}
            {isBuried && (
              <ProductMenuButton
                icon="restore"
                as="button"
                size="16px 16px"
                onClick={() => {
                  dispatch({
                    type: 'product',
                    payload: {
                      ids: [id],
                      operation: 'bury',
                      change: 'remove',
                    },
                  });
                  setIsMenuOpen(false);
                }}
              >
                Unbury
              </ProductMenuButton>
            )}
            {isBlocked && (
              <ProductMenuButton
                icon="restore"
                as="button"
                size="16px 16px"
                onClick={() => {
                  dispatch({
                    type: 'product',
                    payload: {
                      ids: [id],
                      operation: 'block',
                      change: 'remove',
                    },
                  });
                  setIsMenuOpen(false);
                }}
              >
                Restore
              </ProductMenuButton>
            )}
          </ProductMenu>
        )}
      </ProductHeader>
      <Skeleton
        key={index}
        aria-busy="true"
        width="100%"
        height={175}
        animate={false}
      />
      <ProductInfo aria-label="Product details">
        <Typography variant="bodySmall" isStrong data-testid="product title">
          Product {id} not found
        </Typography>
        <Typography variant="bodySmall" align="right" data-testid="product id">
          ID:&nbsp;{id}
        </Typography>
      </ProductInfo>
    </ProductWrapper>
  );
};
