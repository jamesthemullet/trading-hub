import type { ChangeEvent, DetailedHTMLProps, HTMLAttributes } from 'react';
import { useState } from 'react';

import type { Product as ProductType } from '../../api';
import { spacing } from '../utils/spacing';
import { Text } from '../typography/typography.styles';

import { Button } from '../button/button';
import {
  ErrorText,
  LockActions,
  LockInput,
  LockMenu,
  ProductHeader,
  ProductInfo,
  ProductMenu,
  ProductMenuButton,
  ProductMenuOverlay,
  ProductMenuToggle,
  ProductNumber,
  ProductPin,
  ProductWrapper,
  ProductCard,
} from './product.styles';

type ChangePositionTypes = {
  isPinned: boolean;
  id: string;
  newPosition: number;
};

export const ProductDetails = ({
  imageUrl,
  brand,
  isBrandStrong,
  title,
  price,
  productId,
}: Pick<ProductType, 'title' | 'price' | 'brand' | 'productId' | 'imageUrl'> & {
  isBrandStrong?: boolean;
}) => {
  return (
    <>
      <ProductCard>
        <img
          src={`https://asset1.cxnmarksandspencer.com/is/image/mands/${imageUrl[0]}`}
          alt=""
        />
      </ProductCard>
      <ProductInfo aria-label="Product details">
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
  isLastChanged,
  metadata: { isPinned },
  onChangePosition,
  pinnedProductsCount,
  price,
  imageUrl,
  title,
  isBrandStrong,
  isProductNumberEnabled,
  ...rest
}: ProductType & {
  index: number;
  isLastChanged?: boolean;
  onChangePosition: ({
    id,
    isPinned,
    newPosition,
  }: ChangePositionTypes) => void;
  pinnedProductsCount: number;
  totalProducts: number;
  isBrandStrong?: boolean;
  isProductNumberEnabled?: boolean;
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

  // @TODO: this should add to product boost
  const boostToTop = () => pin(0, true);

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

    if (value && parseInt(value) > pinnedProductsCount + diff) {
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
    <ProductWrapper
      aria-label={`Position ${index + 1} ${isLastChanged ? 'updated' : ''}`}
      isLastChanged={!!isLastChanged}
      {...rest}
    >
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
        {isPinned && (
          <ProductPin>
            <Text>Internal</Text>
          </ProductPin>
        )}
        <ProductMenuToggle
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          title={`${isMenuOpen ? 'Close' : 'Open'} menu`}
        >
          <img alt="" src="/trading-hub/asset/icon-plus.svg" />
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
            {!isLockToPositionMenuOpen && (
              <>
                <ProductMenuButton
                  icon="pin"
                  as="button"
                  onClick={() => setIsLockToPositionMenuOpen(true)}
                >
                  {isPinned ? 'Edit position' : 'Pin in position'}
                </ProductMenuButton>
                <ProductMenuButton icon="up" as="button" onClick={boostToTop}>
                  Boost to Top
                </ProductMenuButton>
              </>
            )}

            {isLockToPositionMenuOpen && (
              <LockMenu
                style={{
                  height: error ? '300px' : '245px',
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
                    defaultValue={positionToLockTo}
                    type="number"
                    hasError={!!error.length}
                  />
                  {error && <ErrorText>{error}</ErrorText>}
                  <LockActions>
                    <Button onClick={() => setIsLockToPositionMenuOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      theme="primary"
                      type="submit"
                      isDisabled={!positionToLockTo}
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
      />
    </ProductWrapper>
  );
};
