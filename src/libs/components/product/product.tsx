import type { ChangeEvent, DetailedHTMLProps, HTMLAttributes } from 'react';
import { useState } from 'react';

import Image from 'next/image';

import type { Product as ProductType } from '../../api';
import { EditAttribute } from '../../modules/ruleset/ruleset';
import { Button } from '../buttons/button/button';
import { Text } from '../typography/typography.styles';
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
  ProductHeader,
  ProductInfo,
  ProductMenu,
  ProductMenuButton,
  ProductMenuOverlay,
  ProductMenuToggle,
  ProductNumber,
  ProductPin,
  ProductWrapper,
} from './product.styles';

type ChangePositionTypes = {
  isPinned: boolean;
  id: string;
  newPosition: number;
};

export type ChangeProductBoostBury = {
  id: string;
} & Pick<EditAttribute, 'change' | 'operation'>;

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
        <Text isStrong={isBrandStrong ?? true}>
          {brand} {title}
        </Text>
        <Text>{price}</Text>
        <Text>ID: {productId}</Text>
      </ProductInfo>
    </>
  );
};

export const Product = ({
  brand,
  id,
  productId,
  index,
  metadata: { isPinned, isBoosted, isBuried, isBlocked },
  onChangePosition,
  onProductBoostBury,
  pinnedProductsCount,
  price,
  imageUrl,
  title,
  isBrandStrong,
  isProductNumberEnabled,
  isSearchResult = false,
  ...rest
}: ProductType & {
  index: number;
  onChangePosition: ({
    id,
    isPinned,
    newPosition,
  }: ChangePositionTypes) => void;
  onProductBoostBury: (arg: ChangeProductBoostBury) => void;
  pinnedProductsCount: number;
  isBrandStrong?: boolean;
  isProductNumberEnabled?: boolean;
  isSearchResult?: boolean;
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLockToPositionMenuOpen, setIsLockToPositionMenuOpen] =
    useState(false);
  const [positionToLockTo, setPositionToLockTo] = useState<number>();
  const [error, setError] = useState('');

  const pin = (positionToPin: number, isPinned: boolean) => {
    onChangePosition({
      id,
      newPosition: positionToPin,
      isPinned,
    });
    setIsMenuOpen(false);
  };

  const onBoostBuryBlock = ({
    operation,
    change,
  }: Pick<EditAttribute, 'change' | 'operation'>) => {
    onProductBoostBury({ id, change, operation });
    setIsMenuOpen(false);
  };

  const lockToPosition = (pinTo: number) => {
    setIsMenuOpen(false);
    setIsLockToPositionMenuOpen(false);
    pin(pinTo, true);
  };

  const clearChanges = (position: number) => pin(position, false);

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setPositionToLockTo(parseInt(value));

    const diff = isPinned ? 0 : 1;

    if (
      (value && parseInt(value) > pinnedProductsCount + diff) ||
      (value && parseInt(value) < 1)
    ) {
      if (pinnedProductsCount === 0) {
        setError(`Please choose a position sequentially starting from 1`);
      } else {
        setError(
          `Please choose a position between 1 and ${pinnedProductsCount + diff}`
        );
      }
    } else {
      setError('');
    }
  };

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
            >
              Product actions
            </Text>
            {isPinned && (
              <ProductMenuButton
                icon="restore"
                as="button"
                size="16px 16px"
                onClick={() => clearChanges(index)}
              >
                Restore
              </ProductMenuButton>
            )}
            {isBoosted && (
              <ProductMenuButton
                icon="restore"
                as="button"
                size="16px 16px"
                onClick={() =>
                  onBoostBuryBlock({ operation: 'boosts', change: 'remove' })
                }
              >
                Unboost
              </ProductMenuButton>
            )}
            {isBuried && (
              <ProductMenuButton
                icon="restore"
                as="button"
                size="16px 16px"
                onClick={() =>
                  onBoostBuryBlock({ operation: 'buries', change: 'remove' })
                }
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
                  onBoostBuryBlock({
                    operation: 'block',
                    change: 'remove',
                  });
                }}
              >
                Restore
              </ProductMenuButton>
            )}
            {!isLockToPositionMenuOpen && (
              <>
                <ProductMenuButton
                  icon="pin"
                  as="button"
                  onClick={() => setIsLockToPositionMenuOpen(true)}
                >
                  {isPinned ? 'Edit position' : 'Pin in position'}
                </ProductMenuButton>
                {!isBoosted && (
                  <ProductMenuButton
                    icon="boost"
                    as="button"
                    onClick={() =>
                      onBoostBuryBlock({ operation: 'boosts', change: 'add' })
                    }
                  >
                    Boost to Top
                  </ProductMenuButton>
                )}

                {!isBuried && (
                  <ProductMenuButton
                    icon="bury"
                    as="button"
                    onClick={() =>
                      onBoostBuryBlock({ operation: 'buries', change: 'add' })
                    }
                  >
                    Bury to Bottom
                  </ProductMenuButton>
                )}

                {!isBlocked && (
                  <ProductMenuButton
                    icon="block"
                    as="button"
                    onClick={() =>
                      onBoostBuryBlock({ operation: 'block', change: 'add' })
                    }
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
                <Text isStrong={true} style={{ marginBottom: spacing(1) }}>
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
                      positionToLockTo < pinnedProductsCount + 2
                    ) {
                      lockToPosition(positionToLockTo - 1);
                    }
                  }}
                >
                  <LockInput
                    placeholder="i.e. 3"
                    onChange={onInputChange}
                    defaultValue={positionToLockTo || ''}
                    type="number"
                    autoFocus
                    hasError={!!error.length}
                  />
                  {error && <ErrorText>{error}</ErrorText>}
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
