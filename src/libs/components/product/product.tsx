import type {
  ChangeEvent,
  DetailedHTMLProps,
  Dispatch,
  HTMLAttributes,
} from 'react';
import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import type { Product as ProductType } from '../../api';
import { Button } from '../buttons/button/button';
import { Checkbox } from '../checkboxes/checkbox';
import { Action } from '../types';
import { Text } from '../typography/typography.styles';
import { color } from '../utils/constants';
import { spacing } from '../utils/spacing';
import {
  BlockedPin,
  BoostPin,
  BuriedPin,
  ErrorText,
  LockActions,
  LockInput,
  LockMenu,
  ProductCard,
  ProductCheckbox,
  ProductHeader,
  ProductInfo,
  ProductInfoWrapper,
  ProductMenu,
  ProductMenuButton,
  ProductMenuOverlay,
  ProductMenuToggle,
  ProductNumber,
  ProductPin,
  ProductWrapper,
} from './product.styles';

export const ProductDetails = ({
  imageUrl,
  brand,
  isBrandStrong,
  isSearchResult,
  title,
  price,
  productId,
}: Pick<ProductType, 'title' | 'price' | 'brand' | 'productId' | 'imageUrl'> & {
  isBrandStrong?: boolean;
  isSearchResult?: boolean;
}) => {
  return (
    <>
      <ProductCard>
        <Image
          src={`https://asset1.cxnmarksandspencer.com/is/image/mands/${imageUrl[0]}`}
          alt=""
          width={100}
          height={176}
          style={{ objectFit: 'contain' }}
          priority
          sizes="100%"
        />
      </ProductCard>
      <ProductInfo aria-label="Product details" isSearchResult={isSearchResult}>
        <Text isStrong={isBrandStrong ?? true} aria-label="product title">
          {brand} {title}
        </Text>
        <Text>{price}</Text>
        <Text aria-label="product id">ID: {productId}</Text>
      </ProductInfo>
    </>
  );
};

export type ProductProps = ProductType & {
  hasBulkAction: boolean;
  index: number;
  isPinnable: boolean;
  dispatch: Dispatch<Action>;
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
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export const Product = ({
  brand,
  dispatch,
  hasBulkAction,
  id,
  imageUrl,
  index,
  isBrandStrong,
  isPinnable,
  isProductNumberEnabled,
  isSearchResult = false,
  isSelected,
  isSelectionDisabled,
  metadata: { isPinned, isBoosted, isBuried, isBlocked },
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
      payload: { id, operation: 'pin', change: 'add', position: positionToPin },
    });
  };

  const clearChanges = () => {
    dispatch({
      type: 'product',
      payload: { id, operation: 'pin', change: 'remove' },
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
        setError(`Please choose a position sequentially starting from 1`);
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
          aria-label="menu overlay"
          onClick={() => {
            setIsMenuOpen(!isMenuOpen);
            setIsLockToPositionMenuOpen(false);
          }}
        />
      )}
      <ProductHeader>
        {hasBulkAction && (
          <ProductCheckbox>
            <Checkbox
              label={`Select ${title}`}
              disabled={isSelectionDisabled}
              checked={isSelected}
              onChange={() =>
                onSelectProduct && onSelectProduct({ id, isSelected })
              }
            />
          </ProductCheckbox>
        )}
        <ProductInfoWrapper hasBulkAction={hasBulkAction}>
          {(isProductNumberEnabled ?? true) && (
            <ProductNumber>{index + 1}</ProductNumber>
          )}
          {isBoosted && (
            <BoostPin aria-label="Boosted product">
              <Text>Internal</Text>
            </BoostPin>
          )}
          {isBuried && (
            <BuriedPin aria-label="Buried product">
              <Text>Internal</Text>
            </BuriedPin>
          )}
          {isPinned && (
            <ProductPin aria-label="Pinned product">
              <Text>Internal</Text>
            </ProductPin>
          )}
          {isBlocked && (
            <BlockedPin aria-label="Blocked product">
              <Text>Internal</Text>
            </BlockedPin>
          )}
        </ProductInfoWrapper>
        <ProductMenuToggle
          hasBulkAction={hasBulkAction}
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
            <Text
              isStrong={true}
              style={{
                color: '#000',
                padding: `${spacing(1)} ${spacing(1)} 0`,
              }}
              as="h4"
            >
              Product actions
            </Text>
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
                      id,
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
                      id,
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
                  {
                    dispatch({
                      type: 'product',
                      payload: {
                        id,
                        operation: 'block',
                        change: 'remove',
                      },
                    });
                    setIsMenuOpen(false);
                  }
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
                          id,
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
                          id,
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
                          id,
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
                <Text
                  isStrong={true}
                  style={{ marginBottom: spacing(1) }}
                  aria-label="Pinning heading"
                >
                  Slot position
                </Text>
                <Text style={{ marginBottom: spacing(1) }}>
                  Select the position number you want to set for this product.
                </Text>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
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
        isSearchResult={isSearchResult}
      />
    </ProductWrapper>
  );
};

export const MissingProduct = ({
  dispatch,
  hasBulkAction,
  id,
  index,
  isProductNumberEnabled,
  isPinned,
  isBoosted,
  isBuried,
  isBlocked,
  ...rest
}: {
  dispatch: Dispatch<Action>;
  hasBulkAction: boolean;
  index: number;
  id: string;
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
      payload: { id, operation: 'pin', change: 'remove' },
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
        {(isProductNumberEnabled ?? true) && (
          <ProductNumber>{index + 1}</ProductNumber>
        )}
        {isBoosted && (
          <BoostPin aria-label="Boosted product">
            <Text>Internal</Text>
          </BoostPin>
        )}
        {isBuried && (
          <BuriedPin aria-label="Buried product">
            <Text>Internal</Text>
          </BuriedPin>
        )}
        {isPinned && (
          <ProductPin aria-label="Pinned product">
            <Text>Internal</Text>
          </ProductPin>
        )}
        {isBlocked && (
          <BlockedPin aria-label="Blocked product">
            <Text>Internal</Text>
          </BlockedPin>
        )}
        <ProductMenuToggle
          hasBulkAction={hasBulkAction}
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
            <Text
              isStrong={true}
              style={{
                color: '#000',
                padding: `${spacing(1)} ${spacing(1)} 0`,
              }}
              as="h4"
            >
              Product actions
            </Text>
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
                      id,
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
                      id,
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
                  {
                    dispatch({
                      type: 'product',
                      payload: {
                        id,
                        operation: 'block',
                        change: 'remove',
                      },
                    });
                    setIsMenuOpen(false);
                  }
                }}
              >
                Restore
              </ProductMenuButton>
            )}
          </ProductMenu>
        )}
      </ProductHeader>
      <p style={{ color: color.errorRed }}>Error</p>
      <p aria-label="Error message">Product {id} not found</p>
    </ProductWrapper>
  );
};
