import type {
  ButtonHTMLAttributes,
  ChangeEvent,
  DetailedHTMLProps,
  Dispatch,
  HTMLAttributes,
  ReactElement,
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
import { useBoostWeightMenu } from './use-boost-weight-menu';

const MISSING_IMAGE_SRC =
  'data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22400%22%3E%3Crect width=%22300%22 height=%22400%22 fill=%22%23cccccc%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23ffffff%22 font-family=%22sans-serif%22 font-size=%2240%22%3Emissing%20image%3C/text%3E%3C/svg%3E';

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
  const firstImageUrl = imageUrl?.[0];
  const productName = [brand, title].filter(Boolean).join(' ');

  return (
    <>
      <div className={styles.productCard}>
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
          {productName}
        </Typography>
        {price && <Typography variant={productInfoVariant}>{price}</Typography>}
        {productId && (
          <Typography
            variant={productInfoVariant}
            data-testid="product id"
            align="right"
          >
            ID: {productId}
          </Typography>
        )}
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
    <Button
      type={type}
      appearance="plain"
      className={combinedClassName}
      {...props}
    >
      <Typography variant="bodySmall">{children}</Typography>
    </Button>
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
  canSetBoostWeight?: boolean;
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export const Product = ({
  brand,
  canSetBoostWeight = false,
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
  metadata: { isPinned, isBoosted, isBuried, isBlocked, ranking } = {
    isPinned: false,
  },
  onSelectProduct,
  pinnedProductsCount,
  price,
  productId,
  title,
}: ProductProps): ReactElement => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLockToPositionMenuOpen, setIsLockToPositionMenuOpen] =
    useState(false);
  const [positionToLockTo, setPositionToLockTo] = useState<number>();
  const [error, setError] = useState('');
  const {
    isBoostWeightMenuOpen,
    boostWeight,
    boostWeightError,
    boostWeightInputRef,
    openBoostWeightMenu,
    closeBoostWeightMenu,
    onBoostWeightChange,
    confirmBoost,
  } = useBoostWeightMenu({
    id,
    dispatch,
    onConfirm: () => setIsMenuOpen(false),
  });
  const totalPinnedProducts = pinnedProductsCount ?? 0;
  const slotPositionInputId = `slot-position-${id}`;
  const boostWeightInputId = `boost-weight-${id}`;
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

  useEffect(() => {
    if (!isMenuOpen) {
      setIsLockToPositionMenuOpen(false);
      closeBoostWeightMenu();
    }
  }, [isMenuOpen, closeBoostWeightMenu]);

  return (
    <div
      className={styles.productWrapper}
      data-testid={`Position ${index + 1}`}
    >
      {isMenuOpen && (
        // Note: This is a full-screen invisible button that sits behind the menu to capture clicks outside of the menu for closing it.
        // eslint-disable-next-line no-restricted-syntax
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
          label={`Select ${title || id}`}
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
                      if (canSetBoostWeight) {
                        openBoostWeightMenu();
                      } else {
                        dispatch({
                          type: 'product',
                          payload: {
                            ids: [id],
                            operation: 'boost',
                            change: 'add',
                          },
                        });
                        setIsMenuOpen(false);
                      }
                    }}
                  >
                    Boost to Top
                  </ProductMenuAction>
                )}

                {isBoostWeightMenuOpen && (
                  <div
                    className={`${styles.lockMenu} ${styles.lockMenuInline}`}
                  >
                    <Typography
                      variant="bodySmall"
                      isStrong
                      hasMargin
                      aria-label="Boost weight heading"
                    >
                      Boost amount
                    </Typography>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        // istanbul ignore else — button is disabled when boostWeight is 0 or there is an error
                        if (!boostWeightError && boostWeight > 0) {
                          confirmBoost();
                        }
                      }}
                    >
                      <div className={styles.boostInputWrapper}>
                        <Input
                          id={boostWeightInputId}
                          label="Boost amount %"
                          isLabelHidden
                          ref={boostWeightInputRef}
                          placeholder="i.e. 100"
                          value={boostWeight}
                          onChange={onBoostWeightChange}
                          type="number"
                          step={1}
                          min={1}
                          max={100}
                          aria-invalid={!!boostWeightError.length}
                        />
                        <span
                          className={styles.boostInputSuffix}
                          aria-hidden="true"
                        >
                          %
                        </span>
                      </div>
                      {boostWeightError && (
                        <div
                          className={styles.errorText}
                          data-testid="Boost weight error message"
                        >
                          <Typography as="span" variant="bodySmall">
                            {boostWeightError}
                          </Typography>
                        </div>
                      )}
                      <div
                        className={styles.lockActions}
                        data-is-search-result={isSearchResult}
                      >
                        <Button onClick={() => closeBoostWeightMenu()}>
                          <Typography
                            as="span"
                            variant={lockActionLabelVariant}
                          >
                            Cancel
                          </Typography>
                        </Button>
                        <Button
                          theme="primary"
                          type="submit"
                          isDisabled={!!boostWeightError || !boostWeight}
                        >
                          <Typography
                            as="span"
                            variant={lockActionLabelVariant}
                          >
                            Boost {boostWeight}%
                          </Typography>
                        </Button>
                      </div>
                    </form>
                  </div>
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
                  hasMargin
                  aria-label="Pinning heading"
                >
                  Slot position
                </Typography>
                <Typography variant="bodySmall" hasMargin>
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
  changeType,
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
  changeType?: 'pin' | 'boost' | 'bury' | 'block';
} & DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>): ReactElement => {
  const isPinned = changeType === 'pin';
  const isBoosted = changeType === 'boost';
  const isBuried = changeType === 'bury';
  const isBlocked = changeType === 'block';

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleRemove = (operation: 'pin' | 'boost' | 'bury' | 'block') => {
    dispatch({
      type: 'product',
      payload: { ids: [id], operation, change: 'remove' },
    });
    setIsMenuOpen(false);
  };

  return (
    <div
      className={styles.productWrapper}
      data-testid={`Position ${index + 1}`}
    >
      {isMenuOpen && (
        // Note: This is a full-screen invisible button that sits behind the menu to capture clicks outside of the menu for closing it.
        // eslint-disable-next-line no-restricted-syntax
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
              <ProductMenuAction
                icon="restore"
                onClick={() => handleRemove('pin')}
              >
                Restore
              </ProductMenuAction>
            )}
            {isBoosted && (
              <ProductMenuAction
                icon="restore"
                onClick={() => handleRemove('boost')}
              >
                Unboost
              </ProductMenuAction>
            )}
            {isBuried && (
              <ProductMenuAction
                icon="restore"
                onClick={() => handleRemove('bury')}
              >
                Unbury
              </ProductMenuAction>
            )}
            {isBlocked && (
              <ProductMenuAction
                icon="restore"
                onClick={() => handleRemove('block')}
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
