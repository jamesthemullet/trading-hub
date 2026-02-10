import type {
  ButtonHTMLAttributes,
  ChangeEvent,
  DetailedHTMLProps,
  Dispatch,
  HTMLAttributes,
  ReactNode,
} from 'react';
import { useEffect, useRef, useState } from 'react';
import { Skeleton } from '@mantine/core';

import type {
  MerchandisingProduct as ProductType,
  MerchandisingRankingAttribute,
} from '@/libs/api';
import { Button, Typography } from '@/libs/components';
import { Checkbox } from '@/libs/components/checkboxes/checkbox';
import type { RuleSetActions } from '@/libs/components/types';

import Image from 'next/image';

import { Input } from '../../shared';
import styles from './product.module.css';

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
  const productInfoVariant = isSearchResult ? 'labelLarge' : 'bodySmall';

  return (
    <>
      <div className={styles.productCard}>
        <Image
          src={`https://asset1.cxnmarksandspencer.com/is/image/mands/${imageUrl[0]}`}
          alt=""
          data-testid="productImage"
          width={100}
          height={176}
          priority
          sizes="100%"
          onError={(element) => {
            // eslint-disable-next-line functional/immutable-data
            element.currentTarget.src =
              'https://dummyimage.com/300x400/cccccc/ffffff?text=missing+image';
          }}
        />
        {isOutOfStock && (
          <div className={styles.outOfStockMessage}>
            <Typography variant="bodySmall">Out of stock</Typography>
          </div>
        )}
      </div>
      <div className={styles.productInfo}>
        <Typography
          variant={productInfoVariant}
          isStrong={isBrandStrong ?? true}
          data-testid="product title"
        >
          {brand} {title}
        </Typography>
        <Typography variant={productInfoVariant}>{price}</Typography>
        <Typography
          variant={productInfoVariant}
          data-testid="product id"
          align="right"
        >
          ID: {productId}
        </Typography>
      </div>
      {hasSupplementaryInfo && ranking && (
        <div className={styles.supplementaryInfo}>
          {ranking.map((item) => (
            <Typography variant="bodySmall" key={item.property}>
              {item.property}{' '}
              <Typography as="span" isStrong variant="bodySmall">
                {item.values[0]}
              </Typography>
            </Typography>
          ))}
        </div>
      )}
    </>
  );
};

const PinIndicator = ({
  testId,
  className,
  label,
}: {
  testId: string;
  className: string;
  label: string;
}) => {
  return (
    <div className={`${styles.pinBadge} ${className}`} data-testid={testId}>
      <Typography variant="labelSmall">{label}</Typography>
    </div>
  );
};

type MenuIcon = 'restore' | 'pin' | 'boost' | 'bury' | 'block';

type ProductMenuActionProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: MenuIcon;
  children: ReactNode;
};

const iconClassNameMap: Record<MenuIcon, string> = {
  restore: styles.productMenuButtonRestore,
  pin: styles.productMenuButtonPin,
  boost: styles.productMenuButtonBoost,
  bury: styles.productMenuButtonBury,
  block: styles.productMenuButtonBlock,
};

const ProductMenuAction = ({
  icon,
  className,
  children,
  type = 'button',
  ...props
}: ProductMenuActionProps) => {
  const combinedClassName = [
    styles.productMenuButton,
    iconClassNameMap[icon],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={combinedClassName} {...props}>
      <Typography variant="bodySmall">{children}</Typography>
    </button>
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
}: ProductProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLockToPositionMenuOpen, setIsLockToPositionMenuOpen] =
    useState(false);
  const [positionToLockTo, setPositionToLockTo] = useState<number>();
  const [error, setError] = useState('');
  const totalPinnedProducts =
    pinnedProductsCount || /* istanbul ignore next */ 0;
  const slotPositionInputId = `slot-position-${id}`;
  const canOpenPinPositionMenu =
    isPinnable && (!isPinned || totalPinnedProducts > 1);
  const lockActionLabelVariant = isSearchResult ? 'bodySmall' : 'bodyMedium';

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
    <div
      className={styles.productWrapper}
      data-testid={`Position ${index + 1}`}
    >
      {isMenuOpen && (
        <button
          data-testid="menu overlay"
          onClick={() => {
            setIsMenuOpen(!isMenuOpen);
            setIsLockToPositionMenuOpen(false);
          }}
          aria-label="Close product menu"
          type="button"
        />
      )}
      <div className={styles.productHeader}>
        <Checkbox
          label={`Select ${title}`}
          disabled={isSelectionDisabled}
          checked={isSelected}
          onChange={() => onSelectProduct?.({ id, isSelected })}
        />
        <div className={styles.productInfoWrapper}>
          {(isProductNumberEnabled ?? true) && (
            <div className={styles.productNumber}>
              <Typography variant="bodySmall">{index + 1}</Typography>
            </div>
          )}
          {isBoosted && (
            <PinIndicator
              className={styles.boostPin}
              testId="Boosted product"
              label="Boost"
            />
          )}
          {isBuried && (
            <PinIndicator
              className={styles.buriedPin}
              testId="Buried product"
              label="Bury"
            />
          )}
          {isPinned && (
            <PinIndicator
              className={styles.productPin}
              testId="Pinned product"
              label="Pinned"
            />
          )}
          {isBlocked && (
            <PinIndicator
              className={styles.blockedPin}
              testId="Blocked product"
              label="Block"
            />
          )}
        </div>
        <Button
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
        </Button>
        {isMenuOpen && (
          <div className={styles.productMenu}>
            <div className={styles.productMenuHeader}>
              <Typography variant="bodySmall" isStrong>
                Product actions
              </Typography>
            </div>
            {isPinned && isPinnable && (
              <ProductMenuAction icon="restore" onClick={() => clearChanges()}>
                Restore
              </ProductMenuAction>
            )}
            {isBoosted && (
              <ProductMenuAction
                icon="restore"
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
              </ProductMenuAction>
            )}
            {isBuried && (
              <ProductMenuAction
                icon="restore"
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
              </ProductMenuAction>
            )}
            {isBlocked && (
              <ProductMenuAction
                icon="restore"
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
              </ProductMenuAction>
            )}
            {!isLockToPositionMenuOpen && (
              <>
                {canOpenPinPositionMenu && (
                  <ProductMenuAction
                    icon="pin"
                    onClick={() => setIsLockToPositionMenuOpen(true)}
                  >
                    {isPinned ? 'Edit position' : 'Pin in position'}
                  </ProductMenuAction>
                )}
                {!isBoosted && (
                  <ProductMenuAction
                    icon="boost"
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
                  </ProductMenuAction>
                )}

                {!isBuried && (
                  <ProductMenuAction
                    icon="bury"
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
                  </ProductMenuAction>
                )}

                {!isBlocked && (
                  <ProductMenuAction
                    icon="block"
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
                  </ProductMenuAction>
                )}
              </>
            )}

            {isLockToPositionMenuOpen && (
              <div className={styles.lockMenu} data-error={!!error.length}>
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
                  <Input
                    id={slotPositionInputId}
                    label="Slot position"
                    isLabelHidden
                    ref={inputRef}
                    placeholder="i.e. 3"
                    onChange={onInputChange}
                    type="number"
                    aria-invalid={!!error.length}
                  />
                  {error && (
                    <div
                      className={styles.errorText}
                      data-testid="Error message"
                    >
                      <Typography as="span" variant="bodySmall">
                        {error}
                      </Typography>
                    </div>
                  )}
                  <div
                    className={styles.lockActions}
                    data-is-search-result={isSearchResult}
                  >
                    <Button onClick={() => setIsLockToPositionMenuOpen(false)}>
                      <Typography as="span" variant={lockActionLabelVariant}>
                        Cancel
                      </Typography>
                    </Button>
                    <Button
                      theme="primary"
                      type="submit"
                      isDisabled={!!error || !positionToLockTo}
                    >
                      <Typography as="span" variant={lockActionLabelVariant}>
                        Confirm
                      </Typography>
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
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
    </div>
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
    <div
      className={styles.productWrapper}
      data-testid={`Position ${index + 1}`}
    >
      {isMenuOpen && (
        <button
          aria-label="menu overlay"
          onClick={() => {
            setIsMenuOpen(!isMenuOpen);
          }}
          type="button"
        />
      )}
      <div className={styles.productHeader}>
        <Checkbox
          label={`Select ${id}`}
          disabled={isSelectionDisabled}
          checked={isSelected}
          onChange={() => onSelectProduct?.({ id, isSelected })}
        />
        <div className={styles.productInfoWrapper}>
          {(isProductNumberEnabled ?? true) && (
            <div className={styles.productNumber}>
              <Typography variant="bodySmall">{index + 1}</Typography>
            </div>
          )}
          {isBoosted && (
            <PinIndicator
              className={styles.boostPin}
              testId="Boosted product"
              label="Boost"
            />
          )}
          {isBuried && (
            <PinIndicator
              className={styles.buriedPin}
              testId="Buried product"
              label="Bury"
            />
          )}
          {isPinned && (
            <PinIndicator
              className={styles.productPin}
              testId="Pinned product"
              label="Pinned"
            />
          )}
          {isBlocked && (
            <PinIndicator
              className={styles.blockedPin}
              testId="Blocked product"
              label="Block"
            />
          )}
        </div>
        <Button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          title={`${isMenuOpen ? 'Close' : 'Open'} menu`}
        >
          <Image
            alt=""
            src={`/trading-hub/asset/icon-${isMenuOpen ? 'minus' : 'plus'}.svg`}
            width={20}
            height={20}
          />
        </Button>
        {isMenuOpen && (
          <div className={styles.productMenu}>
            <div className={styles.productMenuHeader}>
              <Typography variant="bodySmall" isStrong as="h4">
                Product actions
              </Typography>
            </div>
            {isPinned && (
              <ProductMenuAction icon="restore" onClick={() => clearChanges()}>
                Restore
              </ProductMenuAction>
            )}
            {isBoosted && (
              <ProductMenuAction
                icon="restore"
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
              </ProductMenuAction>
            )}
            {isBuried && (
              <ProductMenuAction
                icon="restore"
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
              </ProductMenuAction>
            )}
            {isBlocked && (
              <ProductMenuAction
                icon="restore"
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
              </ProductMenuAction>
            )}
          </div>
        )}
      </div>
      <Skeleton
        key={index}
        aria-busy="true"
        width="100%"
        height={175}
        animate={false}
      />
      <div className={styles.productInfo}>
        <Typography variant="bodySmall" isStrong data-testid="product title">
          Product {id} not found
        </Typography>
        <Typography variant="bodySmall" align="right" data-testid="product id">
          ID:&nbsp;{id}
        </Typography>
      </div>
    </div>
  );
};
